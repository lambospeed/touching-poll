import {observer} from "mobx-react"
import {observable} from "mobx"

import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, Page, Button, ToolbarButton, Icon, List, ListItem} from 'react-onsenui';

import DB from "./Database"
import VotePage from './VotePage'
import PollsPage from './pollsPage'
import ResultsPage from './ResultsPage'

@observer export default class MainPage extends React.Component {
  @observable choices = [];

  constructor(props) {
    super(props);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.settings = this.settings.bind(this);
    this.populate = this.populate.bind(this);
    this.stats = this.stats.bind(this);
    this.db = new DB();
    // this.db.drop();
    this.db.create(); // if not created yet
    this.db.polls(this.populate, true);
  }

  populate(polls) {
    console.log("Populating");
    console.log(polls);
    for (var poll of polls) {
      this.choices.push(poll);
    }
  }

  category(name, pid) {
    console.log("Selected option: " + pid);
    this.props.navigator.pushPage({component: VotePage, props: {pid: pid, name: name}})
  }

  stats(name, pid) {
    console.log("Selected stats: " + pid);
    this.props.navigator.pushPage({component: ResultsPage, props: {pid: pid, name: name}})
  }

  settings() {
    this.props.navigator.pushPage({component: PollsPage});
  }


  renderToolbar() {
    return (
      <Toolbar>
        <div className="center"></div>
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
            <ListItem key={idx} ref="choices"
                      className="list__item">
              <div className="center list__item__center"
                   onClick={this.category.bind(this, this.choices[idx].poll, this.choices[idx].ID)}
                   tappable={true}>{this.choices[idx].poll}</div>
              <div className="right"><Button
                onClick={this.stats.bind(this, this.choices[idx].poll, this.choices[idx].ID)}><Icon
                icon="ion-stats-bars"/></Button>
              </div>
            </ListItem>)}
        />
      </Page>
    );
  }
};