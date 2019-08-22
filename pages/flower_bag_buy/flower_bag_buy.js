import {
	Api
} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();

Page({
	data: {

		isFirstLoadAllStandard: ['getMainData'],


	},


	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.id = options.id;
		self.getMainData()

	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			id: self.data.id
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.productGet(postData, callback);
	},
	
	
	goBuy() {
		const self = this;
		api.buttonCanClick(self);
		var orderList = [{
			product: [{
				id: self.data.mainData.id,
				count: 1,
			}, ],
			type: 2,
		}];
		wx.setStorageSync('payPro',orderList);
		api.pathTo('/pages/orderBag/orderBag','nav')
	},

	addOrder(e) {
		const self = this;
		if (self.data.orderId) {
			self.pay(self.data.orderId);
			return
		};
		const postData = {
			tokenFuncName: 'getProjectToken',

			orderList: [{
				product: [{
					id: self.data.mainData.id,
					count: 1,
				}, ],
			}, ],
			type: 2,
			data: {
				balance: self.data.mainData.balance,
				end_time: parseInt(Date.parse(new Date())) + parseInt(self.data.mainData.duration),
			}
		};
		if (!wx.getStorageSync('info') || !wx.getStorageSync('info').headImgUrl) {
			postData.refreshToken = true;
		};
		const callback = (res) => {
			if (res && res.solely_code == 100000) {
				self.data.orderId = res.info.id;
				console.log('self.orderId', self.orderId)
				self.pay(self.data.orderId)
			} else {
				api.showToast(res.msg, 'none')
			};
		};
		api.addOrder(postData, callback);
	},

	pay(order_id) {
		const self = this;
		const postData = {
			wxPay: {
				price: self.data.mainData.price
			}
		};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			id: self.data.orderId
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							const cc_callback = () => {
								api.pathTo('/pages/user/user', 'redi');
							};
							api.showToast('支付成功', 'none', 1000, cc_callback);
						};
					};
					api.realPay(res.info, payCallback);
				} else {
					api.showToast('支付成功', 'none', 1000, function() {
						api.pathTo('/pages/user/user', 'redi');
					});
				};
			} else {
				api.showToast(res.msg, 'none');
			};
		};
		api.pay(postData, callback);
	},

	submit(e) {
		const self = this;
		api.buttonCanClick(self);
		const callback = (user, res) => {
			self.goBuy();
		};
		api.getAuthSetting(callback);
	},


	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

	intoPathRedirect(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},
})
