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

		searchItem: {
			isdefault: 1
		},

		order_id: '',
		isFirstLoadAllStandard: ['getMainData']

	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
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


	addOrder() {
		const self = this;
		if (!self.data.order_id) {
			const postData = {
				tokenFuncName: 'getProjectToken',
				orderList: self.data.mainData,
			};
			console.log('addOrder', self.data.addressData)

			const callback = (res) => {
				if (res && res.solely_code == 100000) {
					wx.removeStorageSync('payPro');
				};
				self.data.order_id = res.info.id
				self.pay(self.data.order_id);
				for (var i = 0; i < self.data.mainData.length; i++) {
					console.log('self.data.mainData[i].id', self.data.mainData[i].id)
					api.deleteFootOne(self.data.mainData[i].id, 'cartData')
				};
			};
			api.addOrder(postData, callback);
		} else {
			self.pay(self.data.order_id)
		}
	},



	pay(order_id) {
		const self = this;
		console.log(self.data.distributionData)
		var order_id = self.data.order_id;
		const postData = {
			token: wx.getStorageSync('token'),
			searchItem: {
				id: order_id,
			},
			wxPay: {
				price: self.data.totalPrice
			},
		};
		postData.payAfter = [];
		postData.payAfter.push({
			tableName: 'FlowLog',
			FuncName: 'add',
			data: {
				count: -self.data.score,
				trade_info: '积分支付',
				user_no: wx.getStorageSync('info').user_no,
				type: 3,
				thirdapp_id: 2
			}
		});
		if (self.data.reward > 0) {
			postData.payAfter.push({
				tableName: 'FlowLog',
				FuncName: 'add',
				data: {
					count: self.data.reward ,
					trade_info: '购物得积分',
					user_no: wx.getStorageSync('info').user_no,
					type: 3,
					thirdapp_id: 2
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
		var score = 0
		var productsArray = self.data.mainData;
		console.log('productsArray', productsArray)
		for (var i = 0; i < productsArray[0].sku.length; i++) {
			console.log('productsArray-price', productsArray[i].product)
			totalPrice += productsArray[0].sku[i].product.price * productsArray[0].sku[i].count;
			score += productsArray[0].sku[i].product.score * productsArray[0].sku[i].count;
			reward += (productsArray[0].sku[i].product.price * productsArray[0].sku[i].count) * (productsArray[0].sku[i].product
				.ratio / 100);
		};
		console.log('totalPrice', totalPrice)
		console.log('reward', reward)
		self.data.totalPrice = totalPrice;
		self.data.reward = reward;
		self.data.score = score;
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
