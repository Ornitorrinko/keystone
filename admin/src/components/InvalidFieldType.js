var React = require('react');

module.exports = React.createClass({

  displayName: 'InvalidFieldType',

  render: function() {
    return <div className="alert alert-danger">Tipo de campo inválido <strong>{this.props.type}</strong> at path <strong>{this.props.path}</strong></div>;
  }

});
