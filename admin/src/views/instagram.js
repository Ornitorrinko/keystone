import React from 'react';
import request from 'superagent';
import _ from 'underscore';
import moment from 'moment';

var View = React.createClass({

  displayName: 'InstagramView',

  getInitialState: function() {
    return {
      hashtag: "",
      tableData: ""
    };
  },

  handleChange: function(event) {
    this.setState({hashtag: event.target.value});
  },

  componentDidMount: function() {

  },

  renderInstagramPosts: function() {
    var self = this;

    self.setState({loading: true});

    if (!this.state.hashtag) {
      alert("é obrigatório informar uma hashtag :)")
      return
    }
    $.ajax({
      method: 'get',
      url: '/api/v1/instagram/hashtag/' + this.state.hashtag
    })
    .done(function(response) {
      var _arr = [];
      if (response.result.data.length) {
        _.each(response.result.data, (element) => {
          _arr.push(self.createTableItem(element))
        })

        // render table
        self.setState({
          tableData: _arr,
          instagramPosts: response.result.data,
          loading: false
        })
      }
    })
    .fail(function(error) {
      alert("Ops :( Não foi possível obter os instagramPosts, tente novamente em instantes")
    })
  },

  approveInstaPost: function(item) {
    var self = this;
    item['type'] = 'instagram';
    item = self.convertToMedia(item)

    // save approved post to media
    $.ajax({
      method: 'post',
      url: '/api/v1/medias/approveMedia',
      dataType: 'json',
      data: item
    })
    .done(function(result) {
      // remove line item from table
      alert("Post aprovado, estará disponível no portal")
      self.rejectInstaPost(item)
    })
    .fail(function(error) {
      alert("Ops :( Não foi possível aprovar os instagramPosts, tente novamente em instantes")
    })
  },

  rejectInstaPost: function(post) {
    // call api
    // remove from list
    var _arr = []
    var self = this
    var lines = _.filter(this.state.instagramPosts, (item) => {
      return post.refId !== item.id
    })

    _.each(lines, (item) => {
      _arr.push(self.createTableItem(item))
    })

    this.setState({
      tableData: _arr,
      instagramPosts: lines
    })
  },

  createTableItem: function(item) {
    let url = `http://instagram.com/${item.user.username}`
    let createdAt = moment.unix(item.created_time)
    let formattedDate = createdAt.format("DD/MM/YY HH:mm")
    return (
      <tr key={item.id}>
        <td><a href={url} target="_blank">@{item.user.username}</a></td>
        <td><a href={item.link} target="_blank"><img src={item.images.thumbnail.url} /></a></td>
        <td>{formattedDate} </td>
        <td>
          <button onClick={this.approveInstaPost.bind(this, item)} className="btn btn-success btn-xs"><i className="fa fa-check"></i></button>
          <button onClick={this.rejectInstaPost.bind(this, item)} className="btn btn-danger btn-xs"><i className="fa fa-trash-o"></i></button>
        </td>
      </tr>
    )
  },

  convertToMedia: function(item) {
    var Media = {
      refId: item.id,
      text: item.caption.text,
      user: item.user.full_name,
      nickname: item.user.username,
      url:  item.link,
      createdAt: item.created_time,
      type: item.type,
      profileImageUrl: item.user.profile_picture,
      backgroundImageUrl: item.images.standard_resolution.url
    }

    return Media
  },

  render: function() {
    let loading = this.state.loading ? 'Aguarde...' : ''
    return (
      <section className="wrapper">
        <div className="row">
          <h1>Moderação de mídias do Instagram</h1>
        </div>
        <div className="row">
          <div className="col-md-6">
            <form role="form" className="form-inline">
              <div className="form-group">
                <label for="exampleInputEmail2" className="sr-only">Busque pela hashtag</label>
                <input id="exampleInputEmail2" type="text" value={this.state.hashtag} onChange={this.handleChange.bind(this)} className="form-control"/>
              </div>
              <button type="button" onClick={this.renderInstagramPosts.bind(this)} className="btn btn-theme">Ir</button>
              <span>{loading}</span>
            </form>
          </div>
          <table className="table table-striped table-advance table-hover">
            <thead>
              <tr>
                <th><i className="fa fa-bullhorn"></i> usuario</th>
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
      </section>
    );
  }

});

React.render(<View />, document.getElementById('instagram-view'));
