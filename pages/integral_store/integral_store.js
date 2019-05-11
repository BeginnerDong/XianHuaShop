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


	onLoad(options) {
		const self = this;
		self.data.category_id=options.category_id;
		api.commonInit(self);
		self.getMainData()


	},


	getMainData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			 thirdapp_id:2,
			 score:['>',0]
		};
		postData.order = {
			listorder: 'desc'
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
						self.data.mainData.push.apply(self.data.mainData, res.info.data);
				} else {
					self.data.isLoadAll = true;
					api.showToast('没有更多了', 'none', 1000);
				};
				console.log(self.data.mainData)
				api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
				self.setData({
					web_mainData: self.data.mainData,
				});
			} else {
				api.showToast(res.msg, 'none')
			}
		};
		api.skuGet(postData, callback);
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
