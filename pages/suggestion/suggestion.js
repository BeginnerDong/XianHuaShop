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
		submitData: {
			mainImg: [],
			phone: '',
			content: '',
			type:1
		},
		buttonCanClick:true,
	},

	onLoad: function() {
		const self = this;
		
		self.setData({
			web_buttonCanClick:self.data.buttonCanClick,
			web_submitData: self.data.submitData
		})
	},

	upLoadImg() {
		const self = this;
		if (self.data.submitData.mainImg.length > 2) {
			api.showToast('仅限3张', 'fail');
			return;
		};
		wx.showLoading({
			mask: true,
			title: '图片上传中',
		});
		const callback = (res) => {
			console.log('res', res)
			if (res.solely_code == 100000) {

				self.data.submitData.mainImg.push({
					type:'image',
					url: res.info.url
				})
				self.setData({
					web_submitData: self.data.submitData
				});
				wx.hideLoading()
			} else {
				api.showToast('网络故障', 'none')
			}
		};

		wx.chooseImage({
			count: 1,
			success: function(res) {
				console.log(res);
				var tempFilePaths = res.tempFilePaths;
				console.log(callback)
				api.uploadFile(tempFilePaths[0], 'file', {
					tokenFuncName: 'getProjectToken'
				}, callback)
			},
			fail: function(err) {
				wx.hideLoading();
			}
		})
	},

	changeBind(e) {
		const self = this;
		if (api.getDataSet(e, 'value')) {
			self.data.submitData[api.getDataSet(e, 'key')] = api.getDataSet(e, 'value');
		} else {
			api.fillChange(e, self, 'submitData');
		};
		self.setData({
			web_submitData: self.data.submitData,
		});
		console.log(self.data.submitData)
	},

	delete(e) {
		const self = this;
		var index = api.getDataSet(e, 'index');
		console.log('deleteImg', index)
		self.data.submitData.mainImg.splice(index, 1);
		self.setData({
			web_submitData: self.data.submitData
		})
	},

	previewImg(e) {
		const self = this;
		var index = e.currentTarget.dataset.index;
		if (self.data.submitData.mainImg.length > 0) {
			for (var i = 0; i < self.data.submitData.mainImg.length; i++) {
				self.data.urlSet.push(self.data.submitData.mainImg[i].url);
			}
		}
		console.log('self.data.submitData.mainImg', self.data.submitData.mainImg)
		wx.previewImage({
			current: self.data.submitData.mainImg[index].url,
			urls: self.data.urlSet,
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
	},

	submit() {
		const self = this;
		api.buttonCanClick(self);
		console.log('self.data.submitData', self.data.submitData);
		var phone = self.data.submitData.phone;
		var newObject = api.cloneForm(self.data.submitData);
		delete newObject.phone;
		const pass = api.checkComplete(newObject);
		console.log('self.data.submitData', self.data.submitData);
		if (pass) {
			

				const callback = (user, res) => {
					self.messageAdd();
				};
				api.getAuthSetting(callback);
			
		} else {
			api.buttonCanClick(self, true)
			api.showToast('请补全信息', 'none')
		};
	},

	messageAdd() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		if (!wx.getStorageSync('info') || !wx.getStorageSync('info').headImgUrl) {
			postData.refreshToken = true;
		};
		postData.data = {};
		postData.data = api.cloneForm(self.data.submitData);
		const callback = (data) => {
			if (data.solely_code == 100000) {
				api.showToast('提交成功', 'none', 1000, function() {
					setTimeout(function() {
						wx.navigateBack({
							delta: 1
						})
					}, 1000);
				})
			} else {
				api.showToast(data.msg, 'none', 1000)
			}

		};
		api.messageAdd(postData, callback);
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
