import {observer} from "mobx-react"
import {observable} from "mobx"

import DB from "./Database"
import React from 'react';
import ReactDOM from 'react-dom';
import {Input, Toolbar, Page, Button, BackButton, ToolbarButton, ListItem, List, Icon} from 'react-onsenui';

@observer export default class OptionsPage extends React.Component {

  @observable choices = [];

  constructor(props) {
    super(props);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.saveOptions = this.saveOptions.bind(this);
    this.newChoice = this.newChoice.bind(this);
    this.delChoice = this.delChoice.bind(this);
    this.save = this.save.bind(this);
    this.populate = this.populate.bind(this);
    this.pid = this.props.pid;
    this.db = new DB();
    this.db.options(this.pid, this.populate);
  }

  populate(options) {
    console.log("Populating options");
    console.log(options);
    for (var option of options) {
      this.choices.push(option);
    }
  }

  newChoice() {
    console.log("New option");
    var c = ReactDOM.findDOMNode(this.refs.choices);
    var inputs = c.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      this.choices[i] = {option: inp.value, ID: inp.name};
    }
    this.choices.push({option: "", ID: -1});
  }

  save() {
    var c = ReactDOM.findDOMNode(this.refs.choices);
    var inputs = c.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (!inp.value)
        continue;
      var opid = parseInt(inp.name);
      if (opid == -1) {
        console.log('Inserting: ' + opid + ' ' + inp.value + ' ' + i);
        this.db.option_insert(this.pid, inp.value, i);
        continue;
      }
      console.log('Saving option: ' + opid + ' ' + inp.value + ' ' + i);
      this.db.option_save(opid, inp.value, i);
    }
  }


  delChoice(idx, opid) {
    opid = parseInt(opid);
    console.log("Delete choice#" + idx + " with opid: " + opid);
    this.choices.splice(idx, 1);
    if (opid == -1) return;
    this.db.option_delete(opid);
  }

  saveOptions() {
    console.log("votes saved");
    this.save();
    this.props.navigator.popPage();
  }

  renderToolbar() {
    return (
      <Toolbar>
        <div className="left"><BackButton><Icon icon="back"/></BackButton></div>
        <div className="right">
          <ToolbarButton onClick={this.saveOptions}><Icon icon="save"/></ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  render() {
    // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 });
    return (
      <Page renderToolbar={this.renderToolbar}>
        <List
          ref="choices"
          dataSource={this.choices.slice()}
          renderRow={(row, idx) => (
            <ListItem key={idx} ref="choices">
              <div className="left">
                <Input placeholder="Beschreibung..." value={this.choices[idx].option} name={this.choices[idx].ID}
                       style={{width: '500px'}}></Input></div>
              <div className="right"><Button onClick={this.delChoice.bind(this, idx, this.choices[idx].ID)}><Icon
                icon="md-delete"/></Button>
              </div>
            </ListItem>)}
        />
        <p style={{textAlign: 'center'}}>
          <Button onClick={this.newChoice}>Neue Wahl</Button>
          {/*<Button onClick={this.popPage.bind(this)}>Pop page</Button>*/}
        </p>
      </Page>
    );
  }
};