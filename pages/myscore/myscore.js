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
		searchItem: {
			type: 3,
			count: ['>', 0]
		},
		isFirstLoadAllStandard: ['getMainData'],
	},


	onLoad() {
		const self = this;
		api.commonInit(self);
		self.getMainData();

	},







	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = api.cloneForm(self.data.searchItem)
		postData.order = {
			create_time: 'desc',
		};
		postData.getAfter = {
			order: {
				tableName: 'Order',
				middleKey: 'order_no',
				key: 'order_no',
				searchItem: {
					status: 1
				},
				condition: '=',
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);

			} else {
				self.data.isLoadAll = true;
				api.showToast('没有更多了', 'none');
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({

				web_mainData: self.data.mainData,
			});
		};
		api.flowLogGet(postData, callback);
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


})
