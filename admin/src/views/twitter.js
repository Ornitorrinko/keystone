// import React from 'react-dom';
// var React = require('react');

import React from 'react';
import request from 'superagent';
import _ from 'underscore';
import moment from 'moment';

var View = React.createClass({

  displayName: 'TwitterView',

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

  renderTweets: function() {
    var self = this;
    $.ajax({
      method: 'get',
      url: '/api/v1/tweets/' + this.state.hashtag
    })
    .done(function(result) {
      var _arr = [];
      if (result.list.length) {
        _.each(result.list, (element) => {
          _arr.push(self.createTableItem(element))
        })

        // render table
        self.setState({
          tableData: _arr,
          tweets: result.list
        })
      }
    })
    .fail(function(error) {
      alert("Ops :( Não foi possível obter os tweets, tente novamente em instantes")
    })
  },

  approveTweet: function(item) {
    var self = this;
    item['type'] = 'twitter';

    // save approved tweet to media
    $.ajax({
      method: 'post',
      url: '/api/v1/medias/approveMedia',
      dataType: 'json',
      data: item
    })
    .done(function(result) {
      // remove line item from table
      alert("Tweet aprovado, estará disponível no portal")
      self.rejectTweet(item)
    })
    .fail(function(error) {
      alert("Ops :( Não foi possível aprovar os tweets, tente novamente em instantes")
    })
  },

  rejectTweet: function(tweet) {
    // call api
    // remove from list
    var _arr = []
    var self = this
    var lines = _.filter(this.state.tweets, (item) => {
      return tweet.id !== item.id
    })

    _.each(lines, (item) => {
      _arr.push(self.createTableItem(item))
    })

    this.setState({
      tableData: _arr,
      tweets: lines
    })
  },

  createTableItem: function(item) {
    return (
      <tr key={item.id}>
        <td>@{item.user.screenName}</td>
        <td className="hidden-phone">{item.text}</td>
        <td>{item.createdAt} </td>
        <td>
          <button onClick={this.approveTweet.bind(this, item)} className="btn btn-success btn-xs"><i className="fa fa-check"></i></button>
          <button onClick={this.rejectTweet.bind(this, item)} className="btn btn-danger btn-xs"><i className="fa fa-trash-o"></i></button>
        </td>
      </tr>
    )
  },

  render: function() {
    return (
      <section className="wrapper">
        <div className="row">
          <h1>Moderação de posts do Twitter</h1>
        </div>
        <div className="row">
          <div className="col-md-6">
            <form role="form" className="form-inline">
              <div className="form-group">
                <label for="exampleInputEmail2" className="sr-only">Busque pela hashtag</label>
                <input id="exampleInputEmail2" type="text" value={this.state.hashtag} onChange={this.handleChange.bind(this)} className="form-control"/>
              </div>
              <button type="button" onClick={this.renderTweets.bind(this)} className="btn btn-theme">Ir</button>
            </form>
          </div>
          <table className="table table-striped table-advance table-hover">
            <thead>
              <tr>
                <th><i className="fa fa-bullhorn"></i> usuario</th>
                <th className="hidden-phone"><i className="fa fa-question-circle"></i> tweet</th>
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

React.render(<View />, document.getElementById('twitter-view'));
