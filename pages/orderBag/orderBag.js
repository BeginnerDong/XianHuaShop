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
		for (var i = 0; i < self.data.mainData[0].product.length; i++) {
			self.data.idData.push(self.data.mainData[0].product[i].id)
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

		const callback = (res) => {
			for (var i = 0; i < self.data.mainData[0].product.length; i++) {
				for (var j = 0; j < res.info.data.length; j++) {
					if (self.data.mainData[0].product[i].id == res.info.data[j].id) {
						self.data.mainData[0].product[i].product = res.info.data[j]
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
		api.productGet(postData, callback);
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
				snap_address:self.data.addressData,
				data: {
					balance: self.data.mainData[0].product[0].product.balance,
					end_time: parseInt(Date.parse(new Date())) + parseInt(self.data.mainData[0].product[0].product.duration),
				}
			};
			console.log('addOrder', self.data.addressData)

			const callback = (res) => {
				if (res && res.solely_code == 100000) {
					wx.removeStorageSync('payPro');
					self.data.order_id = res.info.id
					self.pay();
				
				};

			};
			api.addOrder(postData, callback);
		} else {
			self.pay()
		}
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
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							setTimeout(function() {
								api.pathTo('/pages/user/user', 'rela');
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
			self.data.mainData[0].product[index].count++;
		} else if (api.getDataSet(e, 'type') == '-' && self.data.mainData[0].product[index].count > '1') {
			self.data.mainData[0].product[index].count--;
		}
		self.setData({
			web_mainData: self.data.mainData
		});
		self.countTotalPrice();
	},



	countTotalPrice() {
		const self = this;
		var totalPrice = 0;
		var productsArray = self.data.mainData;
		console.log('productsArray', productsArray)
		for (var i = 0; i < productsArray[0].product.length; i++) {
			console.log('productsArray-price', productsArray[i].product)
			totalPrice += productsArray[0].product[i].product.price * productsArray[0].product[i].count;
		};
		console.log('totalPrice', totalPrice)
		self.data.totalPrice = totalPrice;
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
