import React from 'react';
import request from 'superagent';
import _ from 'underscore';
import moment from 'moment';

var View = React.createClass({

  displayName: 'FacebookView',

  getInitialState: function() {
    return {
      hashtag: "",
      tableData: "",
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

  renderPosts: function() {
    var self = this;
    $.ajax({
      method: 'get',
      url: '/api/v1/facebook/feed'
    })
    .done(function(result) {
      console.log(result);
      var _arr = [];
      var _gallery = [];
      if (result.list) {
        _.each(result.list.posts, (element) => {
          _arr.push(self.createTableItem(element))
        })

        // _.each(result.list.photos, (element) => {
        //   _gallery.push(self.createGalleryItem(element))
        // })

        // render table
        self.setState({
          tableData: _arr,
          galleryData: _gallery,
          posts: result.list.posts
        })
      }
    })
    .fail(function(error) {
      alert("Ops :( Não foi possível obter os posts, tente novamente em instantes")
    })
  },

  approvePost: function(item) {
    var self = this;
    item['type'] = 'facebook';
    item = self.convertToMedia(item)

    $.ajax({
      method: 'post',
      url: '/api/v1/medias/approveMedia',
      dataType: 'json',
      data: item
    })
    .done(function(result) {
      // remove line item from table
      alert("Post aprovado, estará disponível no portal")
      self.rejectPost(item)
    })
    .fail(function(error) {
      alert("Ops :( Não foi possível aprovar os posts, tente novamente em instantes")
    })
  },

  rejectPost: function(facebookPost) {
    // remove from list
    var _arr = []
    var self = this
    var lines = _.filter(this.state.posts, (item) => {
      return facebookPost.refId !== item.id
    })

    _.each(lines, (item) => {
      _arr.push(self.createTableItem(item))
    })

    this.setState({
      tableData: _arr,
      posts: lines
    })
  },

  convertToMedia: function(item) {
    var Media = {
      refId: item.id,
      text: item.message,
      user: item.from.name,
      nickname: item.from.name,
      url:  item.actions ? item.actions[0].link : item.link,
      createdAt: item.created_time,
      type: item.type,
      profileImageUrl: '',
      backgroundImageUrl: item.link
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

  createGalleryItem: function(item) {
    let imageUrl = _.find(item.images, (im) => {
      return im.height == 225;
    })

    return (
      <div className="col-lg-4 col-md-4 col-sm-4 col-xs-12 desc">
        <div className="project-wrapper">
          <div className="project">
            <div className="photo-wrapper">
              <div className="photo">
                <a className="fancybox" href={item.link} target="_blank"><img className="img-responsive" src={imageUrl.source} alt="" /></a>
              </div>
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </div>
    )
  },

  render: function() {
    return (
      <section className="wrapper">
        <div className="row">
          <h1>Moderação de posts do Facebook</h1>
        </div>
        <div className="row">
          <div className="col-md-6">
            <form role="form" className="form-inline">
              <div className="form-group">
                <label for="exampleInputEmail2" className="sr-only">Busque os posts da página do costão</label>
                <input id="exampleInputEmail2" type="text" value={this.state.hashtag} onChange={this.handleChange.bind(this)} className="form-control"/>
              </div>
              <button type="button" onClick={this.renderPosts.bind(this)} className="btn btn-theme">Buscar :)</button>
            </form>
          </div>
          <table className="table table-striped table-advance table-hover">
            <thead>
              <tr>
                <th className="hidden-phone"><i className="fa fa-question-circle"></i> post</th>
                <th><i className="fa fa-bookmark"></i> data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.state.tableData}
            </tbody>
          </table>
        </div>
        {this.state.galleryData}
      </section>
    );
  }

});

React.render(<View />, document.getElementById('facebook-view'));
