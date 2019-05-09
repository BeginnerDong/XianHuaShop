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
		messageData: [],
		skuIdArray: [],
		indicatorDots: true,
		vertical: false,
		autoplay: true,
		circular: true,
		interval: 2000,
		duration: 500,
		previousMargin: 0,
		nextMargin: 0,
		swiperIndex: 0,
		messageData: [],
		mainData: [],
		chooseId: [],
		labelData: [],
		keys: [],
		values: [],
		isShow: false,
		skuData: {},
		count: 1,
		id: '',
		sku_item: [],
		choose_sku_item: [],
		buttonType: '',
		isFirstLoadAllStandard: ['getMainData'],
		searchItem: {},
		merge_can_choose_sku_item: []
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);

		if (options.id) {
			self.data.id = options.id
		};
		self.getMainData()
		self.setData({
			web_count: self.data.count
		})
	},





	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
		};
		postData.getBefore = {
			sku: {
				tableName: 'Sku',
				searchItem: {
					id: ['in', [self.data.id]]
				},
				fixSearchItem: {
					status: 1
				},
				key: 'product_no',
				middleKey: 'product_no',
				condition: 'in',
			}
		};
		postData.getAfter = {
			sku: {
				tableName: 'Sku',
				middleKey: 'product_no',
				key: 'product_no',
				condition: '=',
				searchItem: {
					status: 1
				}
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				for (var key in self.data.mainData.label) {
					if (self.data.mainData.sku_array.indexOf(parseInt(key)) != -1) {
						self.data.labelData.push(self.data.mainData.label[key])
					};
				};
				for (var i = 0; i < self.data.mainData.sku.length; i++) {
					if (self.data.mainData.sku[i].id == self.data.id) {
						self.data.choosed_skuData = api.cloneForm(self.data.mainData.sku[i]);

						self.data.choosed_sku_item = api.cloneForm(self.data.mainData.sku[i].sku_item);
						var skuRes = api.skuChoose(self.data.mainData.sku, self.data.choosed_sku_item);
						self.data.can_choose_sku_item = skuRes.can_choose_sku_item;
						for (var j = 0; j < self.data.choosed_sku_item.length; j++) {
							var finalRes = api.skuChoose(self.data.mainData.sku, [self.data.choosed_sku_item[j]]);
							self.data.merge_can_choose_sku_item.push.apply(self.data.merge_can_choose_sku_item, finalRes.can_choose_sku_item);
						};

						if (self.data.labelData.length == 1) {
							for (var k = 0; k < self.data.labelData.length; k++) {
								self.data.merge_can_choose_sku_item = [];
								for (var m = 0; m < self.data.labelData[k].child.length; m++) {
									self.data.merge_can_choose_sku_item.push(self.data.labelData[k].child[m].id);
								};
							};
						};
						console.log('self.data.merge_can_choose_sku_item', self.data.merge_can_choose_sku_item)
					};
					console.log('222', self.data.mainData.sku)

				};
				self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
			} else {
				api.showToast('商品信息有误', 'none', 1000);
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_choosed_skuData: self.data.choosed_skuData,
				web_labelData: self.data.labelData,
				web_mainData: self.data.mainData,
				web_choosed_sku_item: self.data.choosed_sku_item,
				web_merge_can_choose_sku_item: self.data.merge_can_choose_sku_item,
			});
			console.log('self.data.choosed_skuData', self.data.choosed_skuData)
		};
		api.productGet(postData, callback);
	},





	counter(e) {

		const self = this;
		if (JSON.stringify(self.data.choosed_skuData) != '{}') {
			if (api.getDataSet(e, 'type') == '+') {
				self.data.count++;
			} else if (api.getDataSet(e, 'type') == '-' && self.data.count > '1') {
				self.data.count--;
			}
		} else {
			self.data.count = 1;
		};
		console.log('self.data.count', self.data.count)
		self.countTotalPrice();

	},


	bindManual(e) {
		const self = this;
		var count = e.detail.value;
		self.setData({
			web_count: count
		});
	},



	countTotalPrice() {
		const self = this;
		var totalPrice = 0;
		totalPrice += self.data.count * parseFloat(self.data.skuData.price);
		self.data.totalPrice = totalPrice;
		self.setData({
			web_totalPrice: self.data.totalPrice.toFixed(2),
			web_count: self.data.count

		});
	},



	selectModel(e) {
		const self = this;
		if (self.data.buttonClicked) {
			api.showToast('数据有误请稍等', 'none', 1000);
			setTimeout(function() {
				wx.showLoading();
			}, 800)
			return;
		};
		self.data.buttonType = api.getDataSet(e, 'type');
		console.log(self.data.buttonType)
		var isShow = !self.data.isShow;
		self.setData({
			web_buttonType: self.data.buttonType,
			web_isShow: isShow
		})
	},



	addCart(e) {
		const self = this;
		let formId = e.detail.formId;
		if (JSON.stringify(self.data.choosed_skuData) == '{}') {
			api.buttonCanClick(self, true);
			api.showToast('未选中商品', 'none', 1000);

			return;
		};

		self.data.choosed_skuData.count = self.data.count;
		self.data.choosed_skuData.isSelect = true;
		var res = api.setStorageArray('cartData', self.data.choosed_skuData, 'id', 999);
		if (res) {
			api.showToast('加入成功', 'none', 1000);
			self.data.isShow = !self.data.isShow;
			self.setData({
				web_isShow: self.data.isShow
			})
		};
		var cartData = api.getStorageArray('cartData');
		var cartRes = api.findItemInArray(cartData, 'id', self.data.id);

	},




	chooseSku(e) {
		const self = this;
		console.log('self.data.labelData', self.data.labelData)

		var id = api.getDataSet(e, 'id');
		if (self.data.merge_can_choose_sku_item.indexOf(id) == -1) {
			//self.data.choosed_sku_item = [];
			return;
		};

		var index = self.data.choosed_sku_item.indexOf(id);
		console.log('index', index)
		if (index == -1) {
			var newSkuRes = api.skuChoose(self.data.mainData.sku, [id]);
			var newchoosed_sku_item = api.cloneForm(self.data.choosed_sku_item);
			self.data.choosed_sku_item = [];

			for (var i = 0; i < newchoosed_sku_item.length; i++) {
				if (newSkuRes.can_choose_sku_item.indexOf(newchoosed_sku_item[i]) != -1) {
					self.data.choosed_sku_item.push(newchoosed_sku_item[i]);
				};
			};
			console.log('newSkuRes.can_choose_sku_item', newSkuRes.can_choose_sku_item)


			self.data.choosed_sku_item.push(id);
		} else {
			self.data.choosed_sku_item.splice(index, 1);
		};
		var skuRes = api.skuChoose(self.data.mainData.sku, self.data.choosed_sku_item);
		self.data.choosed_skuData = skuRes.choosed_skuData;
		self.data.can_choose_sku_item = skuRes.can_choose_sku_item;
		self.data.merge_can_choose_sku_item = [];
		if (self.data.choosed_sku_item.length > 0) {
			for (var i = 0; i < self.data.choosed_sku_item.length; i++) {
				var finalRes = api.skuChoose(self.data.mainData.sku, [self.data.choosed_sku_item[i]]);
				self.data.merge_can_choose_sku_item.push.apply(self.data.merge_can_choose_sku_item, finalRes.can_choose_sku_item);
			};
		} else {
			self.data.merge_can_choose_sku_item = self.data.can_choose_sku_item;
		};
		if (self.data.labelData.length > 1) {
			for (var i = 0; i < self.data.labelData.length; i++) {

				var hasone = false;
				for (var j = 0; j < self.data.labelData[i].child.length; j++) {

					if (self.data.choosed_sku_item.indexOf(self.data.labelData[i].child[j].id) != -1) {
						console.log('self.data.labelData[i].child[j].id', self.data.labelData[i].child[j].id)
						hasone = true
					};
				};
				console.log('hasone', hasone)
				if (!hasone) {
					console.log(self.data.labelData[i]);
					for (var j = 0; j < self.data.labelData[i].child.length; j++) {
						var finalRes = api.skuChoose(self.data.mainData.sku, [self.data.labelData[i].child[j].id]);
						var finalIndex = finalRes.can_choose_sku_item.indexOf(self.data.labelData[i].child[j].id);
						finalRes.can_choose_sku_item.splice(finalIndex, 1);
						self.data.merge_can_choose_sku_item.push.apply(self.data.merge_can_choose_sku_item, finalRes.can_choose_sku_item);
					};
				};
			};
		} else {
			for (var i = 0; i < self.data.labelData.length; i++) {
				self.data.merge_can_choose_sku_item = [];
				for (var j = 0; j < self.data.labelData[i].child.length; j++) {
					self.data.merge_can_choose_sku_item.push(self.data.labelData[i].child[j].id);
				};
			};
		};


		self.data.count = 1;
		self.countTotalPrice();

		console.log('self.data.mainData.sku', self.data.mainData.sku);
		console.log('self.data.choosed_sku_item', self.data.choosed_sku_item);
		console.log('self.data.can_choose_sku_item', self.data.can_choose_sku_item);
		console.log('self.data.choosed_skuData', self.data.choosed_skuData);
		self.setData({
			web_choosed_sku_item: self.data.choosed_sku_item,
			web_choosed_skuData: self.data.choosed_skuData,
			web_merge_can_choose_sku_item: self.data.merge_can_choose_sku_item,
		});

	},




	swiperChange(e) {
		const that = this;
		that.setData({
			swiperIndex: e.detail.current,
		})
	},



	goBuy() {
		const self = this;
		api.buttonCanClick(self);
		if (JSON.stringify(self.data.choosed_skuData) == '{}') {
			api.buttonCanClick(self, true);
			api.showToast('未选中商品', 'none', 1000);
			return;
		};
		var orderList = [{
			sku: [{
				id: self.data.choosed_skuData.id,
				count: self.data.count
			}],
			type: 1,
		}];
		wx.setStorageSync('payPro',orderList);
		api.pathTo('/pages/oder-true/oder-true','nav')
	},





	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

	isShow() {
		const self = this;
		self.data.isShow = !self.data.isShow;
		self.setData({
			web_isShow: self.data.isShow
		})
	},




})
