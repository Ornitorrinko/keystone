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
    self.setState({loading: true});
    $.ajax({
      method: 'get',
      url: '/api/v1/facebook/feed'
    })
    .done(function(data) {
      console.log(data);
      var _arr = [];
      var _gallery = [];
      if (data.result) {
        _.each(data.result, (element) => {
          _arr.push(self.createTableItem(element))
        })

        // render table
        self.setState({
          tableData: _arr,
          posts: data.result,
          loading: false
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

  deleteMedia: function(item) {
    var self = this;
    item = self.convertToMedia(item)

    $.ajax({
      method: 'post',
      url: '/api/v1/medias/deleteMedia',
      dataType: 'json',
      data: item
    })
    .done(function(result) {
      alert("Post removido, não estará mais disponível no portal")
      self.rejectPost(item)
    })
    .fail(function(error) {
      alert("Ops :( Não foi possível remover este post, tente novamente em instantes")
    })
  },

  convertToMedia: function(item) {
    var Media = {
      refId: item.id,
      text: item.message,
      user: item.from.name,
      nickname: item.from.name,
      url:  item.actions ? item.actions[0].link : item.full_picture,
      createdAt: item.created_time,
      type: item.type,
      profileImageUrl: '',
      backgroundImageUrl: item.full_picture
    }

    return Media
  },

  createTableItem: function(item) {
    let story = item.story || ''
    let styleTd = {
      width: '60%'
    }
    let buttonAction;
    let formatedDate = moment(item.created_time).format("DD/MM/YYYY HH:mm")

    // if item is already added, we need to show the icon to remove it.
    // if not added, show icon to save it :)
    if (item.added) {
      buttonAction = (
        <button onClick={this.deleteMedia.bind(this, item)} className="btn btn-danger btn-xs"><i className="fa fa-trash-o"></i></button>
      )
    } else {
      buttonAction = (
        <button onClick={this.approvePost.bind(this, item)} className="btn btn-success btn-xs"><i className="fa fa-check"></i></button>
      )
    }

    return (
      <tr key={item.id}>
        <td style={styleTd}>
          <a href={item.link}>{item.message}</a>
        </td>
        <td>{formatedDate} </td>
        <td><img src={item.picture}/></td>
        <td>
          {buttonAction}
          <button onClick={this.rejectPost.bind(this, item)} className="btn btn-danger btn-xs"><i className="fa fa-times"></i></button>
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
    let loading = this.state.loading ? 'Aguarde...' : '';
    return (
      <section className="wrapper">
        <div className="row">
          <h1>Moderação de posts do Facebook</h1>
          <span></span>
          <span>{loading}</span>
        </div>
        <div className="row">
          <table className="table table-striped table-advance table-hover">
            <thead>
              <tr>
                <th className="hidden-phone"><i className="fa fa-question-circle"></i> post</th>
                <th><i className="fa fa-bookmark"></i> data</th>
                <th>imagem</th>
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
