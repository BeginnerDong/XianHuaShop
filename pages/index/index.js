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
		indicatorDots: false,
		vertical: false,
		autoplay: true,
		circular: true,
		interval: 2000,
		duration: 500,
		previousMargin: 0,
		nextMargin: 0,
		sliderData: [],
		cardOneData: [],
		cardTwoData: [],
		labelData:[],
		isFirstLoadAllStandard: ['getSliderData', 'getCardOneData', 'getCardTwoData'],
	},
	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getSliderData();
		self.getCardOneData();
		self.getCardTwoData();
		self.getLabelData()
	},

	getSliderData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			title: '首页轮播'
		};
		const callback = (res) => {
			console.log(1000, res);
			if (res.info.data.length > 0) {
				self.data.sliderData = res.info.data[0]

			}
			self.setData({
				web_sliderData: self.data.sliderData,
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getSliderData', self);
		};
		api.labelGet(postData, callback);
	},



	getCardOneData() {
		const self = this;
		const postData = {};
		postData.searchItem = {};
		postData.searchItem.type = 2;
		postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
		postData.order = {
			listorder: 'desc'
		};
		postData.getBefore = {
			label: {
				tableName: 'Label',
				searchItem: {
					title: ['=', ['鲜花包']],
				},
				middleKey: 'category_id',
				key: 'id',
				condition: 'in'
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.cardOneData = res.info.data[0]
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getCardOneData', self);
			self.setData({
				web_cardOneData: self.data.cardOneData,
			});
		};
		api.productGet(postData, callback);
	},

	getCardTwoData() {
		const self = this;
		const postData = {};
		postData.searchItem = {};
		postData.searchItem.type = 2;
		postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
		postData.order = {
			listorder: 'desc'
		};
		postData.getBefore = {
			label: {
				tableName: 'Label',
				searchItem: {
					title: ['=', ['定制花管家']],
				},
				middleKey: 'category_id',
				key: 'id',
				condition: 'in'
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.cardTwoData = res.info.data[0]
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getCardTwoData', self);
			self.setData({
				web_cardTwoData: self.data.cardTwoData,
			});
		};
		api.productGet(postData, callback);
	},

	getLabelData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type: 3,
		};
		postData.getBefore = {
			caseData: {
				tableName: 'Label',
				searchItem: {
					title: ['=', ['鲜花']],
				},
				middleKey: 'parentid',
				key: 'id',
				condition: 'in',
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.labelData.push.apply(self.data.labelData, res.info.data);
			}
			console.log(self.data.labelData)
			self.setData({
				web_labelData: self.data.labelData,
			});
		};
		api.labelGet(postData, callback);
	},



	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll) {
			self.data.paginate.currentPage++;

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
