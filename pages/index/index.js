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
		size:14,//宽度即文字大小
		marqueeW:0,
		moveTimes:8,//一屏内容滚动时间为8s
		allT:"0s",
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
		flowerData:[],
		scoreData:[],
		labelData:[],
		isFirstLoadAllStandard: ['getSliderData', 'getCardOneData', 'getCardTwoData','getFlowerData','getScoreData'],
	},
	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getSliderData();
		self.getCardOneData();
		self.getCardTwoData();
		self.getLabelData();
		self.getFlowerData();
		self.getScoreData();
	},
	
	getFlowerData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id:2,
			score:0
		};
		postData.order = {
			listorder: 'desc'
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.flowerData.push.apply(self.data.flowerData,res.info.data)
			};
			if(self.data.flowerData.length>4){
			  self.data.flowerData = self.data.flowerData.slice(0,4) 
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getFlowerData', self);
			self.setData({
				web_flowerData: self.data.flowerData,
			});
		};
		api.skuGet(postData, callback);
	},
	
	getScoreData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id:2,
			score:['>',0]
		};
		postData.order = {
			listorder: 'desc'
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.scoreData.push.apply(self.data.scoreData,res.info.data)
			}
			if(self.data.scoreData.length>2){
			  self.data.scoreData = self.data.scoreData.slice(0,2) 
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getScoreData', self);
			self.setData({
				web_scoreData: self.data.scoreData,
			});
		};
		api.skuGet(postData, callback);
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
				self.data.sliderData = res.info.data[0];
				self.data.text = self.data.sliderData.description
				
			}
			var screenW=wx.getSystemInfoSync().windowWidth;//获取屏幕宽度
			var contentW=self.data.text.length*self.data.size;//获取文本宽度（大概宽度）
			var allT=(contentW/screenW)*self.data.moveTimes;//文字很长时计算有几屏
			allT=allT<8?8:allT;//不够一平-----最小滚动一平时间
			
			self.setData({
				marqueeW:-contentW+"px",allT:allT+"s",
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
