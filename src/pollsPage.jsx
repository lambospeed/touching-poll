import {observer} from "mobx-react"
import {observable} from "mobx"

import DB from "./Database"
import React from 'react';
import OptionsPage from './OptionsPage';
import MainPage from './MainPage';
import ReactDOM from 'react-dom';
import {Input, Toolbar, Page, Button, BackButton, ToolbarButton, ListItem, List, Icon} from 'react-onsenui';

@observer export default class PollsPage extends React.Component {

  @observable choices = [];

  constructor(props) {
    super(props);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.savePolls = this.savePolls.bind(this);
    this.newCategory = this.newCategory.bind(this);
    this.newChoice = this.newChoice.bind(this);
    this.delCategory = this.delCategory.bind(this);
    this.populate = this.populate.bind(this);
    this.optionsWithPid = this.optionsWithPid.bind(this);
    this.db = new DB();
    this.db.polls(this.populate);
  }

  populate(polls) {
    console.log("Populating");
    console.log(polls);
    for (var poll of polls) {
      this.choices.push(poll);
    }
  }

  save() {
    var c = ReactDOM.findDOMNode(this.refs.choices);
    var inputs = [];
    var tmp = c.getElementsByTagName("input");
    for (var i in tmp) {
      var inp = tmp[i];
      if (inp.type == "text")
        inputs.push(inp);
    }
    var checkboxes = c.getElementsByClassName("chk");
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (!inp.value)
        continue;
      var pid = parseInt(inp.name);
      console.log("checkbox for " + i + " is: " + checkboxes[i].value);
      var visible = checkboxes[i].checked ? 1 : 0;
      if (pid == -1) {
        console.log('Saving: ' + pid + ' ' + inp.value + ' ' + i + " v: " + visible);
        this.db.poll_insert(inp.value, i, visible);
        continue;
      }
      console.log('Saving: ' + pid + ' ' + inp.value + ' ' + i + " v: " + visible);
      this.db.poll_save(pid, inp.value, i, visible);
    }
  }


  newCategory() {
    console.log("New option");
    var c = ReactDOM.findDOMNode(this.refs.choices);
    var inputs = c.getElementsByTagName("input"); // when using class, the property `name` becomes undefined!
    var checkboxes = c.getElementsByClassName("chk");
    var shift = 0;
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (inp.type != "text") {
        shift++;
        continue;
      }
      this.choices[i - shift] = {poll: inp.value, ID: inp.name, visible: checkboxes[i - shift].checked ? 1 : 0};
    }
    this.choices.push({poll: "", ID: -1, visible: 1});
    // this.render();

  }

  optionsWithPid(pid) {
    this.props.navigator.pushPage({component: OptionsPage, props: {pid: pid}});
  }

  newChoice(idx, pid) {
    console.log("New choice for pid: " + pid);
    if (pid == -1) {
      // save first
      console.log("Saving option");
      var inp = ReactDOM.findDOMNode(this.refs.choices).getElementsByClassName("inp")[idx];
      var visible = ReactDOM.findDOMNode(this.refs.choices).getElementsByClassName("chk")[idx].checked ? 1 : 0;
      this.db.poll_insert(inp.value, idx, visible, this.optionsWithPid);
      return;
    }
    this.optionsWithPid(pid);
  }

  delCategory(idx, pid) {
    pid = parseInt(pid);
    console.log("Deleting poll#poll" + idx + " with pid: " + pid);
    this.choices.splice(idx, 1);
    if (pid == -1)
      return;
    this.db.poll_delete(pid);

  }

  savePolls() {
    console.log("polls saved");
    this.save();
    this.props.navigator.replacePage({component: MainPage});
  }

  renderToolbar() {
    return (
      <Toolbar>
        <div className="left"><BackButton><Icon icon="back"/></BackButton></div>
        <div className="right">
          <ToolbarButton onClick={this.savePolls}><Icon icon="save"/></ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  render() {
    // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 });

    return (
      <Page modifier="appbcg" renderToolbar={this.renderToolbar}>
        <List
          ref="choices"
          dataSource={this.choices.slice()}
          renderRow={(row, idx) => (
            <ListItem key={idx} ref="choices">
              <div className="left">
                <Input type="checkbox" className="chk" checked={this.choices[idx].visible}
                       style={{width: '30px'}}/>
                <Input autocomplete="false" className="inp" placeholder="Beschreibung..."
                       value={this.choices[idx].poll}
                       name={this.choices[idx].ID}
                       style={{width: '500px'}}/>
              </div>
              <div className="right">
                <Button style={{marginRight: '7px'}}
                        onClick={this.newChoice.bind(this, idx, this.choices[idx].ID)}><Icon icon="cog"/></Button>
                <Button onClick={this.delCategory.bind(this, idx, this.choices[idx].ID)}><Icon
                  icon="md-delete"/></Button>
              </div>
            </ListItem>)}
        />
        <p style={{textAlign: 'center'}}>
          <Button onClick={this.newCategory}>Neue Kategorie</Button>
          {/*<Button onClick={this.popPage.bind(this)}>Pop page</Button>*/}
        </p>
      </Page>
    );
  }
};