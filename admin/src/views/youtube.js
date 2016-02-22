import React from 'react';
import request from 'superagent';
import _ from 'underscore';
import moment from 'moment';

var View = React.createClass({

  displayName: 'YoutubeView',

  getInitialState: function() {
    return {
      hashtag: "",
      galleryData: "",
      buttonState: ""
    };
  },

  handleChange: function(event) {
    this.setState({hashtag: event.target.value});
  },

  componentDidMount: function() {
    this.renderPosts()
  },

  handleMediaItems: function(list) {
    let self = this
    let chunk = []
    let medias = []

    if (_.isArray(list) &&  !_.isUndefined(list) && list.length > 0 ) {
      let clonedList = _.clone(list)

      while(clonedList.length) {
        chunk.push(clonedList.splice(0, 3))
      }

      if (chunk.length) {
        _.each(chunk, (element, i) => {
          medias.push(self.draw(element, i))
        })
      }
    }

    return medias
  },

  renderPosts: function() {
    let self = this;
    $.ajax({
      method: 'get',
      url: '/api/v1/youtube/videos/costaochannel'
    })
    .done(function(data) {

      if (!data.success) {
        return alert("Não foi possível carregar os vídeos do seu canal")
      }
      
      if (data.result) {

        let medias = self.handleMediaItems(data.result)

        self.setState({
          galleryData: medias,
          posts: data.result
        })
      }
    })
    .fail(function(error) {
      console.log(error);
      alert("Ops :( Não foi possível obter os posts, tente novamente em instantes")
    })
  },

  approvePost: function(item) {
    var self = this;
    item['type'] = 'video';
    item = self.convertToMedia(item)

    $.ajax({
      method: 'post',
      url: '/api/v1/medias/approveMedia',
      dataType: 'json',
      data: item
    })
    .done(function(result) {
      // remove line item from table
      alert("Video aprovado, estará disponível no portal")
      self.rejectPost(item)
    })
    .fail(function(error) {
      alert("Ops :( Não foi possível aprovar os videos, tente novamente em instantes")
    })
  },

  rejectPost: function(videoPost) {
    // remove from list
    var _arr = []
    var self = this
    var lines = _.filter(this.state.posts, (item) => {
      return videoPost.refId !== item.id
    })

    let medias = self.handleMediaItems(lines)

    self.setState({
      galleryData: medias,
      posts: lines
    })
  },

  deleteMedia: function(item) {
    var self = this;
    item['type'] = 'video';
    item = self.convertToMedia(item)

    $.ajax({
      method: 'post',
      url: '/api/v1/medias/deleteMedia',
      dataType: 'json',
      data: item
    })
    .done(function(result) {
      alert("Video removido, não estará mais disponível no portal")
      self.rejectPost(item)
    })
    .fail(function(error) {
      alert("Ops :( Não foi possível remover este vídeo, tente novamente em instantes")
    })
  },

  convertToMedia: function(item) {
    var bgUrl = item.snippet.thumbnails.standard ? item.snippet.thumbnails.standard.url : item.snippet.thumbnails.default.url
    var Media = {
      refId: item.id,
      text: item.snippet.title,
      user: item.channelTitle,
      nickname: item.channelTitle,
      type: item.type,
      linkId: item.contentDetails.videoId || item.snippet.resourceId.videoId,
      backgroundImageUrl: bgUrl,
      createdAt: item.snippet.publishedAt
    }

    return Media
  },

  createTableItem: function(item) {
    let story = item.story || ''
    return (
      <tr key={item.id}>
        <td>
          <a href={item.link}>{item.message}</a>
        </td>
        <td>{item.created_time} </td>
        <td>
          <button onClick={this.approvePost.bind(this, item)} className="btn btn-success btn-xs"><i className="fa fa-check"></i></button>
          <button onClick={this.rejectPost.bind(this, item)} className="btn btn-danger btn-xs"><i className="fa fa-trash-o"></i></button>
        </td>
      </tr>
    )
  },

  createGalleryItem: function(item, index) {
    let imageUrl = _.find(item.snippet.thumbnails, (im) => {
      return im.height == 360;
    })

    let buttonAction;

    // if item is already added, we need to show the icon to remove it.
    // if not added, icon to save it :)
    if (item.added) {
      buttonAction = (
        <div className="pull-left">
          <span>remover video do portal </span>
          <button onClick={this.deleteMedia.bind(this, item)} className="btn btn-danger btn-xs"><i className="fa fa-trash-o"></i></button>
        </div>
        
      )
    } else {
      buttonAction = (
        <div className="pull-left">
          <span>incluir no portal </span>
          <button onClick={this.approvePost.bind(this, item)} className="btn btn-success btn-xs"><i className="fa fa-check"></i></button>
        </div>
      )
    }

    let videoLink = `https://www.youtube.com/watch?v=${item.contentDetails.videoId}` 

    return (
      <div className="col-lg-4 col-md-4 col-sm-4 col-xs-12 desc">
        {buttonAction}
        <div  className="pull-right">
          <span>rejeitar </span>
          <button onClick={this.rejectPost.bind(this, item)} className="btn btn-danger btn-xs"><i className="fa fa-times"></i></button>
        </div>
        <div className="clearfix" ></div>
        <div className="project-wrapper">
          <div className="project">
            <div className="photo-wrapper">
              <div className="photo">
                <a className="fancybox" href={videoLink} target="_blank"><img className="img-responsive" src={imageUrl.url} alt={imageUrl.description} /></a>
              </div>
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </div>
    )
  },

  draw(chunk, i) {

    let cards = chunk.map( (element, index, arr) => {
      return this.createGalleryItem(element, index, arr)
    })

    return (
      <div key={i} className="row mt">
        {cards}
      </div>
    )
  },

  render: function() {

    return (
      <section className="wrapper">
        <div className="row">
          <h1>Moderação de vídeos do Canal Costão</h1>
        </div>
        {this.state.galleryData}
      </section>
    );
  }

});

React.render(<View />, document.getElementById('youtube-view'));
