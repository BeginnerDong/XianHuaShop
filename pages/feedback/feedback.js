import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
	data: {

		isFirstLoadAllStandard: ['getMainData'],


	},


	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getMainData()
	},
	
	
	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			title: '客服电话'
		};
		const callback = (res) => {
			console.log(1000, res);
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0]
			}
			self.setData({
				web_mainData: self.data.mainData,
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
		};
		api.labelGet(postData, callback);
	},
	
	
	intoPathRedirect(e){
	  const self = this;
	  api.pathTo(api.getDataSet(e,'path'),'redi');
	},
	
	intoPath(e){
	  const self = this;
	  api.pathTo(api.getDataSet(e,'path'),'nav');
	}
	
})
