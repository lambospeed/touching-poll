import {observer} from "mobx-react"
import {observable} from "mobx"

import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, Page, Button, BackButton, ToolbarButton, Icon, List, ListItem} from 'react-onsenui';

import DB from "./Database"
import VotePage from './VotePage'
import PollsPage from './pollsPage'

@observer export default class ResultsPage extends React.Component {
  @observable choices = [];

  constructor(props) {
    super(props);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.populate = this.populate.bind(this);
    this.db = new DB();
    this.pid = this.props.pid;
    this.name = this.props.name;
    this.db.statistics(this.pid, this.populate);
  }

  populate(stats) {
    console.log("Populating for: " + this.name);
    console.log("Count: " + stats.count);
    console.log(stats.votes);
    var c = ReactDOM.findDOMNode(this.refs.hdr);
    c.getElementsByClassName("hdr")[0].innerHTML = this.name + " (" + stats.count + " Abstimmungen)";
    for (var stat of stats.votes) {
      this.choices.push(stat);
    }
  }

  category(pid) {
    console.log("Selected option: " + pid);
    this.props.navigator.pushPage({component: VotePage, props: {pid: pid}})
  }


  renderToolbar() {
    return (
      <Toolbar>
        <div className="left"><BackButton><Icon icon="back"/></BackButton></div>
        <div className="center hdr"></div>
        <div className="right">

        </div>
      </Toolbar>
    );
  }


  render() {
    var classNames = require('classnames');
    return (
      <Page ref="hdr" renderToolbar={this.renderToolbar}>
        <List
          dataSource={this.choices.slice()}
          renderRow={(row, idx) => (
            <ListItem key={idx} ref="choices"
                      className="list__item">
              <div
                style={{marginLeft: "-15px", paddingLeft: "45px"}}
                className={classNames('center', 'list__item__center', 'result_row', {'top_choice': this.choices[idx].rank == 0}, {'second_choice': this.choices[idx].rank == 1}, {'third_choice': this.choices[idx].rank == 2})}>{this.choices[idx].option}</div>
              <div
                style={{paddingRight: "40px"}}
                className={classNames('right', 'result_row', {'top_choice': this.choices[idx].rank == 0}, {'second_choice': this.choices[idx].rank == 1}, {'third_choice': this.choices[idx].rank == 2})}>{this.choices[idx].percentage}%
              </div>
            </ListItem>)
          }

        />
      </
        Page
      >
    )
      ;
  }
}
;