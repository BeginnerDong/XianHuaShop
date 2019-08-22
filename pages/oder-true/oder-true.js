import {
	Api
} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();



Page({
	data: {
		mainData: [],
		addressData: [],
		idData: [],
		date:'',
		timeArray:['上午','下午'],
		searchItem: {
			isdefault: 1
		},
		submitData:{
			notice:''
		},
		order_id: '',
		isFirstLoadAllStandard: ['getMainData']

	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.date = api.CurentDate();
		self.setData({
			web_timeArray:self.data.timeArray,
			web_date:self.data.date,
		})
	},



	onShow() {
		const self = this;

		self.data.searchItem = {};
		if (getApp().globalData.address_id) {
			self.data.searchItem.id = getApp().globalData.address_id;
		} else {
			self.data.searchItem.isdefault = 1;
		};
		self.data.mainData = api.jsonToArray(wx.getStorageSync('payPro'), 'unshift');
		console.log('self.data.mainData', self.data.mainData)
		for (var i = 0; i < self.data.mainData[0].sku.length; i++) {
			self.data.idData.push(self.data.mainData[0].sku[i].id)
		}
		self.getMainData();
		console.log(self.data.idData);
		self.getAddressData();

	},









	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			id: ['in', self.data.idData]
		};
		postData.getAfter = {
			label: {
				tableName: 'Label',
				middleKey: ['sku_item', 0],
				key: 'id',
				searchItem: {
					status: 1
				},
				condition: '=',
				info: ['title']
			}
		};
		const callback = (res) => {
			for (var i = 0; i < self.data.mainData[0].sku.length; i++) {
				for (var j = 0; j < res.info.data.length; j++) {
					if (self.data.mainData[0].sku[i].id == res.info.data[j].id) {
						self.data.mainData[0].sku[i].product = res.info.data[j]
					}
				}
			};
			self.setData({
				web_mainData: self.data.mainData,
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			console.log(self.data.mainData);
			self.countTotalPrice();
		};
		api.skuGet(postData, callback);
	},

	getAddressData() {
		const self = this;
		const postData = {}
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = api.cloneForm(self.data.searchItem);
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.addressData = res.info.data[0];
			};
			console.log('getAddressData', self.data.addressData)
			self.setData({
				web_addressData: self.data.addressData,
			});
		};
		api.addressGet(postData, callback);
	},

	submit() {
		const self = this;
		api.buttonCanClick(self);
		if (self.data.addressData.length == 0) {
			api.buttonCanClick(self, true);
			api.showToast('请选择收货地址', 'none');
			return;
		};

		const callback = (user, res) => {
			self.addOrder();
		};
		api.getAuthSetting(callback);
	},
	
	changeBind(e) {
		const self = this;
		if (api.getDataSet(e, 'value')) {
			self.data.submitData[api.getDataSet(e, 'key')] = api.getDataSet(e, 'value');
		} else {
			api.fillChange(e, self, 'submitData');
		};
		self.setData({
			web_submitData: self.data.submitData,
		});
		console.log(self.data.submitData)
	},

	addOrder() {
		const self = this;
		if(!self.data.time){
			api.buttonCanClick(self, true);
			api.showToast('请选择送达时间', 'none');
			return;
		};
		if (!self.data.order_id) {
			const postData = {
				tokenFuncName: 'getProjectToken',
				orderList: self.data.mainData,
				snap_address: self.data.addressData,
				data:{
					passage1:self.data.date+' '+self.data.time,
					express_info:self.data.submitData.notice
				}
			};
			console.log('addOrder', self.data.addressData)

			const callback = (res) => {
				if (res && res.solely_code == 100000) {
					wx.removeStorageSync('payPro');
					self.data.order_id = res.info.id
					self.getOrderData();
				};

			};
			api.addOrder(postData, callback);
		} else {
			self.getOrderData()
		}
	},

	bindDateChange(e) {
		const self = this;
		console.log('picker发送选择改变，携带值为', e.detail.value)
		self.data.date = e.detail.value;
		self.setData({
			web_date:self.data.date,
		})
	},
	bindTimeChange(e) {
		const self = this;
		console.log('picker发送选择改变，携带值为', e.detail.value)
		self.data.time = self.data.timeArray[e.detail.value];
		self.setData({
			web_index:e.detail.value,
			web_time:self.data.time
		})
	},

	getOrderData() {
		const self = this;
		console.log(111)
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			id: self.data.order_id
		};
		const callback = (res) => {
			console.log('res', res)
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.orderData = res.info.data[0];
					self.pay(self.data.orderData.id)
				}
			};
		}
		api.orderGet(postData, callback);
	},


	pay() {
		const self = this;
		var order_id = self.data.order_id;
		const postData = {
			token: wx.getStorageSync('token'),
			searchItem: {
				id: order_id,
			},
			wxPay: {
				price: self.data.totalPrice
			}
		};
		postData.payAfter = [];
		if (self.data.reward > 0) {
			postData.payAfter.push({
				tableName: 'FlowLog',
				FuncName: 'add',
				data: {
					count: self.data.reward,
					trade_info: '购物得积分',
					user_no: wx.getStorageSync('info').user_no,
					type: 3,
					thirdapp_id: 2,
					order_no: self.data.orderData.order_no
				}
			});
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							setTimeout(function() {
								api.pathTo('/pages/allOder/allOder', 'redi');
							}, 800)
						};
					};
					api.realPay(res.info, payCallback);
				}
			} else {
				api.showToast('支付失败', 'none')
			}
		};
		api.pay(postData, callback);
	},



	counter(e) {

		const self = this;
		var index = api.getDataSet(e, 'index');
		console.log(index)
		if (api.getDataSet(e, 'type') == '+') {
			self.data.mainData[0].sku[index].count++;
		} else if (api.getDataSet(e, 'type') == '-' && self.data.mainData[0].sku[index].count > '1') {
			self.data.mainData[0].sku[index].count--;
		}
		self.setData({
			web_mainData: self.data.mainData
		});
		self.countTotalPrice();
	},



	countTotalPrice() {
		const self = this;
		var totalPrice = 0;
		var reward = 0;
		var productsArray = self.data.mainData;
		console.log('productsArray', productsArray)
		for (var i = 0; i < productsArray[0].sku.length; i++) {
			console.log('productsArray-price', productsArray[i].product)
			totalPrice += productsArray[0].sku[i].product.price * productsArray[0].sku[i].count;
			reward += (productsArray[0].sku[i].product.price * productsArray[0].sku[i].count) * (productsArray[0].sku[i].product
				.ratio / 100);
		};
		console.log('totalPrice', totalPrice)
		console.log('reward', reward)
		self.data.totalPrice = totalPrice;
		self.data.reward = reward;
		console.log(self.data.totalPrice)
		self.setData({
			web_totalPrice: totalPrice.toFixed(2),
		});

	},

	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

})
