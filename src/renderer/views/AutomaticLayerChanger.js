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
import PageHeader from "../modules/PageHeader";
import Callout from "../component/Callout";
import Title from "../component/Title";
import { IconCloseXs } from "../component/Icon";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Select } from "../component/Select";

const Store = require("electron-store");
const store = new Store();

const Styles = Styled.div`
&.wrapper {
  display: grid;
  grid-template-columns: minmax(auto,240px) 1fr;
  margin-top: 24px;
}

.header {
  padding: 24px 32px;
  display: flex;
  align-items: baseline;
}

.layerChangerRow{  
    height: 100%;
    padding: 16px;
    border-radius: 3px;
    background-color: ${({ theme }) => theme.styles.superkeyAction.background};
    &:hover {
        background-color: ${({ theme }) => theme.styles.superkeyAction.backgroundActive};
    }
  }
.layerChangerAction {  
  display: flex;
    flex-wrap: wrap;
    flex-shrink: 1;
    flex-flow: column;
    align-items: start;
    height: 100%;
    color: ${({ theme }) => theme.styles.superkeyAction.color};
    padding: 24px 16px;
    border-radius: 3px;
    background-color: ${({ theme }) => theme.styles.superkeyAction.background};
    &.active {
        background-color: ${({ theme }) => theme.styles.superkeyAction.backgroundActive};
    }
  h5 {
      color: ${({ theme }) => theme.styles.superkeyButton.titleColor};
      font-weight: 700;
      font-size: 13px;
      margin-top: 12px;
      letter-spacing: 0.04em;
  }
  .description {
      color: ${({ theme }) => theme.styles.superkeyButton.descriptionColor};
      margin-bottom: 8px;
      font-weight: 395;
      font-size: 14px;
      flex-shrink: 1;
      align-self: self-start;

  }   
  .layerChangerTitle {
      flex-shrink: 1;
      margin-bottom: 8px;    
      align-self: self-start;
      &.single {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          h5 {
              margin: 0 0 0 8px;
          }
      }
  }
  .listModifiersTags {
    position: absolute;
    top: 48px;
    left: 10px;
    .labelModifier {
      padding: 2px 6px;
      font-weight: 600;
      font-size: 10px;
    }
  }
}

.layerChangerDeleteButton {
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.brandPrimary};
  border-radius: 4px;
  color: #fff;
  position: absolute;
  text-align: center;
  line-height: 22px;
  transition: 300ms opacity ease-in-out;
  opacity: 1;
  &:hover {
      cursor: pointer;
  }
}
`;

class AutomaticLayerChanger extends React.Component {
  constructor(props) {
    super(props);
    this.inputOpenFileRef = React.createRef();
    this.state = {
      STLs: store.get("STLs") || [], // STL means serviceToLayer
      currentLanguageLayout: store.get("settings.language") || "english"
    };
    this.addNewRow = this.addNewRow.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.setServiceName = this.setServiceName.bind(this);
    this.getLayersNames = this.getLayersNames.bind(this);
    this.setLayer = this.setLayer.bind(this);
  }

  showOpenFileDlg = id => {
    this.inputOpenFileRef.current.click();
    this.inputOpenFileRef.current.setAttribute("lastClickedID", id);
  };

  async deleteRow(id) {
    //const tl = new TaskList();
    // let tasks = await tl.getTasksList();
    let STLs = this.state.STLs;
    STLs.splice(id, 1);
    this.setState({
      STLs
    });
    store.set("STLs", STLs);
  }

  async addNewRow() {
    //const tl = new TaskList();
    // let tasks = await tl.getTasksList();
    let STLs = this.state.STLs;
    STLs.push({ layer: STLs.length, service: "test.exe" });
    this.setState({
      STLs
    });
    store.set("STLs", STLs);
  }

  async setServiceName(name) {
    const clickedID = this.inputOpenFileRef.current.getAttribute("lastClickedID");
    this.inputOpenFileRef.current.value = null;
    let STLs = this.state.STLs;
    STLs[clickedID].service = name;
    this.setState({
      STLs
    });
    store.set("STLs", STLs);
  }

  async setLayer(index, value) {
    let STLs = this.state.STLs;
    STLs[index].layer = value;
    this.setState({
      STLs
    });
    store.set("STLs", STLs);
  }

  getLayersNames() {
    const neurons = store.get("neurons");
    let layersNames = neurons[0].layers;
    layersNames = layersNames.map((item, index) => {
      return { text: item.name != "" ? item.name : `Layer ${index + 1}`, value: index, index };
    });
    return layersNames;
  }

  render() {
    const { currentLanguageLayout, STLs } = this.state;
    const layers = this.getLayersNames();
    console.log(layers);
    const STLList = STLs.map((STL, id) => {
      return (
        <div className={`wrapper`} key={id}>
          <div className={`layerChangerRow`}>
            <Row>
              <Col xs={5} className="px-5 gridded">
                <p
                  style={{ marginTop: "0", marginBottom: "0" }}
                  onClick={() => this.showOpenFileDlg(id)}
                >{`Service: ${STL.service}`}</p>
              </Col>
              <Col xs={5} className="px-5 gridded">
                <Select
                  onSelect={v => {
                    this.setLayer(id, v);
                  }}
                  value={layers[STL.layer].text}
                  listElements={layers}
                />
              </Col>
              <Col xs={2} className="px-5 gridded">
                <div className="layerChangerButtonWrapper">
                  <div className="layerChangerDeleteButton" onClick={() => this.deleteRow(id)}>
                    <IconCloseXs />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      );
    });
    return (
      <Styles className="AutomaticLayerChanger">
        <input
          ref={this.inputOpenFileRef}
          type="file"
          style={{ display: "none" }}
          onChange={v => this.setServiceName(v.target.files[0].name)}
          accept=".exe"
        />
        <Container fluid="md">
          <PageHeader text={i18n.app.menu.autolayerchanger} />
          <Callout content={i18n.editor.autolayerchanger.callout} className="mt-md" size="sm" />
          <Styles className="wrapper">
            <Row>
              <div className="headerWrapper">
                <RegularButton
                  buttonText={i18n.editor.autolayerchanger.addNewRow}
                  style="outline gradient"
                  size="sm"
                  onClick={this.addNewRow}
                />
              </div>
            </Row>
          </Styles>
          <br />
          {STLList}
        </Container>
      </Styles>
    );
  }
}

export default AutomaticLayerChanger;
