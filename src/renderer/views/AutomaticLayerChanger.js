// -*- mode: js-jsx -*-
/* Bazecor -- Kaleidoscope Command Center
 * Copyright (C) 2018, 2019  Keyboardio, Inc.
 * Copyright (C) 2019  DygmaLab SE
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from "react";
import Styled from "styled-components";
import TaskList from "../../api/tasklist";
import i18n from "../i18n";
import Container from "react-bootstrap/Container";
import { RegularButton } from "../component/Button";

const Store = require("electron-store");
const store = new Store();

const Styles = Styled.div`
  .toggle-button{
    text-align: center;
    padding-bottom: 8px;
  }
  .list-group-item {
    border: none !important;
    background-color: ${({ theme }) => theme.card.background};
  }
  .save-button {
    text-align: center;
  }
  .save-row {
    position: absolute;
    right: 30px;
    top: 65px;
  }
  .button-large {
    font-size: 2rem;
    width: -webkit-fill-available;
    text-align: left;
  }
  .cancel-active{
    background-color: ${({ theme }) => theme.colors.button.cancel};
  }
  .save-active{
    background-color: ${({ theme }) => theme.colors.button.save};
  }
  .button-large:not(:disabled):not(.disabled):hover {
    color: ${({ theme }) => theme.colors.button.text};
    background-color: ${({ theme }) => theme.colors.button.active};
    border: none;
  }
`;

class AutomaticLayerChanger extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentLanguageLayout: store.get("settings.language") || "english"
    };
    this.test = this.test.bind(this);
  }

  async componentDidMount() {}

  async test() {
    const tl = new TaskList();
    let tasks = await tl.getTasksList(); 
  }

  render() {
    const { currentLanguageLayout } = this.state;

    return (
      <Styles className="AutomaticLayerChanger">
        <Container fluid>
          <RegularButton buttonText={i18n.editor.autolayerchanger.test} style="outline gradient" size="sm" onClick={this.test} />
        </Container>
      </Styles>
    );
  }
}

export default AutomaticLayerChanger;
