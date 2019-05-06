import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    currentId:0
  },
  onLoad: function () {
    const self = this;
    
    self.setData({
    	currentId:self.data.currentId
    })
  },
	tabs(e){
		const self = this;
		self.data.currentId = api.getDataSet(e,'id');
		self.setData({
			currentId:self.data.currentId
		})
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
