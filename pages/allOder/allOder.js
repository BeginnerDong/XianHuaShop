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
		num: 0,
		mainData: [],
		isFirstLoadAllStandard: ['getMainData'],
		searchItem: {},

	},


	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.mainData = [];
		if(options.num){
		  self.changeSearch(options.num)
		}else{
		  self.getMainData()  
		};
		self.setData({
		  web_mainData:self.data.mainData
		});
		
	},

	onShow() {
		const self = this;
		
	},


	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = api.cloneForm(self.data.searchItem);
		postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
		postData.searchItem.type = 1;
		postData.searchItem.status = ['in', [1, -1]]
		postData.order = {
			create_time: 'desc'
		}
		postData.getAfter = {
			label: {
				tableName: 'Label',
				middleKey: ['products', 0, 'snap_product', 'sku_item', 0],
				key: 'id',
				searchItem: {
					status: 1
				},
				condition: '=',
				info: ['title']
			}
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true)
				if (res.info.data.length > 0) {
					self.data.mainData.push.apply(self.data.mainData, res.info.data);
				} else {
					self.data.isLoadAll = true;
					api.showToast('没有更多了', 'none');
				};

				self.setData({
					web_mainData: self.data.mainData,
				});
			} else {
				api.buttonCanClick(self, true)
				api.showToast('网络故障', 'none')
			};

			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			console.log('getMainData', self.data.mainData)
		};
		api.orderGet(postData, callback);
	},

	deleteOrder(e) {
		const self = this;
		const postData = {};
		postData.token = wx.getStorageSync('token');
		postData.searchItem = {};
		postData.searchItem.id = api.getDataSet(e, 'id');
		const callback = res => {
			api.dealRes(res);
			self.getMainData(true);
		};
		api.orderDelete(postData, callback);
	},

	orderUpdate(e) {
		const self = this;
		var index = api.getDataSet(e, 'index');
		console.log('index', index)
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.data = {
			order_step: 3,
			transport_status: 2,
		}
		postData.searchItem = {};
		postData.searchItem.id = self.data.mainData[index].id;

		const callback = res => {
			api.showToast('已确认收货', 'none');
			self.getMainData(true);
		};
		api.orderUpdate(postData, callback);
	},


	countTotalPrice(e) {
		const self = this;
		api.buttonCanClick(self);
		var index = api.getDataSet(e, 'index');
		var totalPrice = 0;
		var reward = 0;
		var score = 0
		var productsArray = self.data.mainData[index].products;
		console.log('productsArray', productsArray)
		for (var i = 0; i < productsArray.length; i++) {
			console.log('productsArray-price', productsArray[i].product)
			totalPrice += productsArray[i].snap_product.price * productsArray[i].count;
			score += productsArray[i].snap_product.score * productsArray[0].count;
			reward += (productsArray[i].snap_product.price * productsArray[i].count) * (productsArray[i].snap_product
				.ratio / 100);
		};
		console.log('totalPrice', totalPrice)
		console.log('reward', reward)
		self.data.totalPrice = totalPrice;
		self.data.reward = reward;
		self.data.score = score;
		self.pay(index)
	},



	pay(index) {
		const self = this;
		const postData = {
			tokenFuncName: 'getProjectToken',
			searchItem: {
				id: self.data.mainData[index].id,
			},
			wxPay: {
				price: self.data.totalPrice
			},
		};
		postData.payAfter = [];
		if (self.data.score) {
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
		}
		if (self.data.reward > 0) {
			postData.payAfter.push({
				tableName: 'FlowLog',
				FuncName: 'add',
				data: {
					count: self.data.reward,
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
							self.getMainData(true);
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



	menuClick: function(e) {
		const self = this;
		api.buttonCanClick(self);
		const num = e.currentTarget.dataset.num;
		self.changeSearch(num);
	},

	changeSearch(num) {
		const self = this;
		this.setData({
			num: num
		});
		self.data.searchItem = {}
		if (num == '0') {

		} else if (num == '1') {
			self.data.searchItem.pay_status = '0';

		} else if (num == '2') {
			self.data.searchItem.pay_status = '1';
			self.data.searchItem.transport_status = '0';
		} else if (num == '3') {
			self.data.searchItem.pay_status = '1';
			self.data.searchItem.transport_status = '1';
		} else if (num == '4') {
			self.data.searchItem.pay_status = '1';
			self.data.searchItem.transport_status = '2';
		} else if (num == '5') {
			self.data.searchItem.status = -1;
		}
		self.setData({
			web_mainData: [],
		});
		self.getMainData(true);
	},


	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.getMainData();
		};
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
