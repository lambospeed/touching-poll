import {observer} from "mobx-react"
import {observable} from "mobx"

import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, Page, Button, BackButton, ToolbarButton, Icon, List, ListItem} from 'react-onsenui';

import DB from "./Database"
import OptionsPage from './OptionsPage'
import ResultsPage from './ResultsPage'
import PollsPage from './pollsPage'

@observer export default class VotePage extends React.Component {
  @observable choices = [];

  constructor(props) {
    super(props);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.populate = this.populate.bind(this);
    this.vote = this.vote.bind(this);
    this.db = new DB();
    this.pid = this.props.pid;
    this.name = this.props.name;
    this.db.options(this.pid, this.populate);
  }

  populate(options) {
    console.log("Populating");
    console.log(options);
    for (var option of options) {
      this.choices.push(option);
    }
  }

  vote(opid) {
    console.log("Voted for: " + opid);
    this.db.vote_insert(this.pid, opid);
    this.props.navigator.replacePage({component: ResultsPage, props: {pid: this.pid, name: this.name}});
  }


  renderToolbar() {
    return (
      <Toolbar>
        <div className="left"><BackButton><Icon icon="back"/></BackButton></div>
        <div className="center">{this.name}</div>
        <div className="right">
          <ToolbarButton onClick={this.settings}><Icon icon="cog"/></ToolbarButton>
        </div>
      </Toolbar>
    );
  }


  render() {
    return (
      <Page renderToolbar={this.renderToolbar}>
        <List
          dataSource={this.choices.slice()}
          renderRow={(row, idx) => (
            <ListItem onClick={this.vote.bind(this, this.choices[idx].ID)} key={idx} ref="choices"
                      className="list__item" tappable={true}>
              <div className="center list__item__center">{this.choices[idx].option}</div>
              <div className="right"></div>
            </ListItem>)}
        />
      </Page>
    );
  }
};