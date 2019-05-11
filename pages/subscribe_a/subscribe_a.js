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
		searchItem: {},
		isFirstLoadAllStandard: ['getMainData'],
	},


	onLoad() {
		const self = this;
		api.commonInit(self);
		self.getMainData()


	},
	
	getMainData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
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
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			console.log(self.data.mainData)
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.labelGet(postData, callback);
	},

	

	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.getMainData();
		};
	},

	intoPathRedirect(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},

	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	}

})
