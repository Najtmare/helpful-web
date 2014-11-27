/** @jsx React.DOM */

var Response = React.createClass({
  componentDidMount: function() {
    this.initMediumEditor();
  },

  initMediumEditor: function() {
    var $response = $('.medium-editor');
    var editor = new MediumEditor($response, {
      placeholder: $response.attr('placeholder'),
      buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'indent', 'outdent']
    });

    $response.keydown(function (e) {
      if (e.which === 9) {
        e.preventDefault();

        if (e.shiftKey) {
          document.execCommand('outdent', false, null);
        } else {
          document.execCommand('indent', false, null);
        }
      }
    });
  },

  sendMessage: function(event) {
    event.stopPropagation();
    event.preventDefault();

    this.createMessage();
  },

  sendAndArchiveMessage: function(event) {
    event.stopPropagation();
    event.preventDefault();

    this.createMessage();
    this.props.archiveHandler();
  },

  // TODO: Include file attachments
  createMessage: function() {
    if(this.props.demo) {
      $.get('/user.json', function(response) {
        var message = {
          id: 'message-' + (new Date()).getTime(),
          content: $('.medium-editor').html(),
          type: 'message',
          person: response.user.person
        };

        this.addStreamItem(message);
        this.clearResponse();
      }.bind(this));

      return;
    }

    var data = {
      message: {
        conversation_id: this.props.conversation.id,
        content: $('.medium-editor').html()
      }
    };

    $.ajax({
      type: 'POST',
      url: this.props.conversation.create_message_path,
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      accepts: { json: 'application/json' },
      success: function(response) {
        this.addStreamItem(response.message);
        this.clearResponse();
      }.bind(this)
    });
  },

  addStreamItem: function(streamItem) {
    this.props.addStreamItemHandler(streamItem);
  },

  clearResponse: function() {
    $('.medium-editor').html('');
  },

  useCannedResponseHandler: function(cannedResponse) {
    $('.medium-editor').html(cannedResponse.rendered_message);
    $('.medium-editor').removeClass('medium-editor-placeholder');
    $('.medium-editor').focus();
  },

  renderCommandBar: function() {
    if(!this.props.demo) {
      return (
        <div className="btn-group">
          <AssignmentButton conversation={this.props.conversation} addStreamItemHandler={this.props.addStreamItemHandler} />
          <TagButton conversation={this.props.conversation} addStreamItemHandler={this.props.addStreamItemHandler} />
          <CannedResponseButton conversation={this.props.conversation} addStreamItemHandler={this.props.addStreamItemHandler} useCannedResponseHandler={this.useCannedResponseHandler} />
        </div>
      );
    }
  },

  renderArchiveButton: function() {
    if(!this.props.conversation.archived) {
      return (
          <button className="btn btn-default" onClick={this.sendAndArchiveMessage}>Send And Archive</button>
      );
    }
  },

  render: function() {
    return (
      <form className="form">
        <div className="form-group">
          <div className="form-control form-control-invisible medium-editor" placeholder="Write your reply..." onKeyDown={this.metaSend} onKeyPress={this.ctrlSend}></div>
        </div>

        <div className="form-actions">
          <div className="pull-right">
            <div className="btn-toolbar">
              {this.renderArchiveButton()}
              <button className="btn btn-primary" onClick={this.sendMessage}>Send</button>
            </div>
          </div>

          {this.renderCommandBar()}
        </div>
      </form>
    );
  },

  metaSend: function(e) {
    if (e.keyCode == 13 && e.metaKey) {
      this.sendMessage(e);
    }
  },

  ctrlSend: function(e) {
    if (e.keyCode == 13 && e.ctrlKey) {
      e.preventDefault();
      this.sendMessage(e);
    }
  }
});
