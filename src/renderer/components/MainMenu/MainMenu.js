/* eslint-disable react/jsx-filename-extension */
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

import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavbarBrand from "react-bootstrap/NavbarBrand";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Styled from "styled-components";

import i18n from "../../i18n";
import Focus from "../../../api/focus";

import WelcomeMenu from "./WelcomeMenu";
import EditorMenuItem from "./EditorMenuItem";
import MacroEditorItem from "./MacroEditorItem";
import SuperkeyEditorItem from "./SuperkeyEditorItem";
import FlashMenuItem from "./FlashMenuItem";
import KeyboardMenuItem from "./KeyboardSelectMenuItem";
import PreferencesMenuItem from "./PreferencesMenuItem";
import SoftwareUpdateMenuItem from "./SoftwareUpdateMenuItem";
import ExitMenuItem from "./ExitMenuItem";

import { NavigationButton } from "../../component/Button";
import { IconKeyboardSelector } from "../../component/Icon";
import { IconKeyboard2Stroke } from "../../component/Icon";
import { IconMemory2Stroke } from "../../component/Icon";
import { IconRobot2Stroke } from "../../component/Icon";
import { IconThunder2Stroke } from "../../component/Icon";
import { IconPreferences2Stroke } from "../../component/Icon";

import DygmaLogo from "../../../../static/logo.png";
import { fwVersion } from "../../../../package.json";

const { remote } = require("electron");

const drawerWidth = 64;

const Styles = Styled.div`
.brand-image {
  padding: 0 !important;
  margin-left: 0;
  margin-top: 20px;
  margin-bottom: 32px;
  display: block;
  width: 100%;
  text-align: center;
  -webkit-app-region: drag;
  img {
    margin: 0;
    height: ${({ theme }) => theme.drawerWidth - 16}px;
    width: ${({ theme }) => theme.drawerWidth - 16}px;
  }
}
.left-navbar {
  // background: ${({ theme }) => theme.colors.gardient};
  background-color: ${({ theme }) => theme.navbar.background};
  background-color: #0B0219;
  width: ${({ theme }) => theme.drawerWidth}px; 
  width: 120px;
  height: 100vh;
  display: block !important;

  position: fixed !important;
  z-index: 10;
  padding: 12px !important;
}
.list-link {
  display: flex;
  .item-list {
    .icon-item {
      .icon-image {
        width: ${({ theme }) => theme.drawerWidth - 10}px;
        height: ${({ theme }) => theme.drawerWidth - 10}px;
        margin-left: 5px;
        padding 10px;
        margin-top: 15px;
        margin-bottom: 15px;
        color: ${({ theme }) => theme.navbar.color};
        align-content: center;
        text-align: center;
        &:hover {
          background-color: rgba(255,255,255,0.3);
          border-radius: 8px;
        }
      }
    }
    .icon-text {
      .primary {
        font-size: 0.8em;
        color: black;
      }
      .secondary {
        font-size: 0.7em;
        color: gray;
      }
    }
  }
  &:hover {
    text-decoration: none;
  }
}
.list-link+.list-link {
  margin-top: 8px;
}
.disabled {
  color: ${({ theme }) => theme.card.disabled};
}
.sec{
  background-color: red;
  border-radius: 10px;
  color: white;
  padding: 1px 4px;
  position: absolute;
  top: -70px;
  left: 22px;
}
.relative-pos {
  position: relative;
  width: 0;
  height: 0;
}
.select {
  background-color: ${({ theme }) => theme.card.backgroundActive};
  border-radius: 8px;
  width: 100%;
}
`;

class MainMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      versions: null,
      flashing: props.flashing
    };
  }

  componentDidMount() {
    const focus = new Focus();
    let versions;

    focus.command("version").then(v => {
      if (!v) return;
      let parts = v.split(" ");
      versions = {
        bazecor: parts[0],
        kaleidoscope: parts[1],
        firmware: parts[2]
      };
      this.setState({ versions: versions, flashing: this.props.flashing });
    });
  }

  componentDidUpdate(previousProps, previousState) {
    if (this.props.flashing != previousProps.flashing) {
      this.setState({ flashing: this.props.flashing });
    }
    if (this.state.versions != null && this.state.versions.bazecor.length > 0 && this.state.flashing == previousState.flashing) {
      return;
    }
    const focus = new Focus();
    let versions;

    focus.command("version").then(v => {
      if (!v) return;
      let parts = v.split(" ");
      versions = {
        bazecor: parts[0],
        kaleidoscope: parts[1],
        firmware: parts[2]
      };
      this.setState({ versions: versions, flashing: this.props.flashing });
    });
  }

  cleanFWVer(version) {
    let ver = version != null ? (version[0] != "v" ? version : version.substring(1)) : null;
    return ver
      .replace(/beta/g, "")
      .split(".")
      .map(n => parseInt(n));
  }

  compareFWVer(oldVer, newVer) {
    if (oldVer.length != newVer.length) {
      if (oldVer.length > newVer.length) {
        return -1;
      } else {
        return 1;
      }
    }
    for (var i = 0; i < oldVer.length; ++i) {
      if (oldVer[i] == newVer[i]) {
        continue;
      } else if (oldVer[i] > newVer[i]) {
        return -1;
      } else {
        return 1;
      }
    }
    return 0;
  }

  renderTooltip(text) {
    return <Tooltip id="button-tooltip">{text}</Tooltip>;
  }

  render() {
    const { connected, pages, history } = this.props;
    const currentPage = history.location.pathname;
    const setCurrentPage = history.push;

    // const homePage = connected
    //   ? pages.keymap
    //     ? "/editor"
    //     : "/welcome"
    //   : "/keyboard-select";
    let fwVer = this.state.versions != null ? this.cleanFWVer(this.state.versions.bazecor) : [];
    let newVer = this.cleanFWVer(fwVersion);
    let showNotif = this.compareFWVer(fwVer, newVer);

    return (
      <Styles>
        <Navbar className="left-navbar sidebar" sticky="top">
          <NavbarBrand as={Link} to="/" className="brand-image d-lg-block">
            <img alt="" src={DygmaLogo} className="d-inline-block align-top" />
          </NavbarBrand>
          <Nav className="mr-auto flex-column flex-row">
            {/* <Link to="/welcome" className="list-link">
              <WelcomeMenu
                selected={currentPage === "/welcome"}
                userMenu={i18n.app.menu.userMenu}
                drawerWidth={drawerWidth}
                onClick={() => setCurrentPage("/welcome")}
              />
            </Link> */}
            <div>
              {connected && (
                <>
                  {pages.keymap && (
                    <React.Fragment>
                      <Link to="/editor" className="list-link">
                        <NavigationButton
                          selected={currentPage === "/editor"}
                          drawerWidth={drawerWidth}
                          onClick={() => setCurrentPage("/editor")}
                          buttonText={"Layout <br>Editor"}
                          icoSVG={<IconKeyboard2Stroke />}
                        />
                      </Link>
                      <Link to="/macros" className="list-link">
                        <NavigationButton
                          selected={currentPage === "/macros"}
                          drawerWidth={drawerWidth}
                          onClick={() => setCurrentPage("/macros")}
                          buttonText={"Macro <br>Editor"}
                          icoSVG={<IconRobot2Stroke />}
                        />
                      </Link>

                      <Link to="/autolayerchanger" className="list-link">
                        <NavigationButton
                          selected={currentPage === "/autolayerchanger"}
                          drawerWidth={drawerWidth}
                          onClick={() => setCurrentPage("/autolayerchanger")}
                          buttonText={"Auto Layer changer"}
                          icoSVG={<IconRobot2Stroke />}
                        />
                      </Link>

                      <Link to="/superkeys" className="list-link">
                        <NavigationButton
                          selected={currentPage === "/superkeys"}
                          drawerWidth={drawerWidth}
                          onClick={() => setCurrentPage("/superkeys")}
                          buttonText={"Superkeys <br>Editor"}
                          icoSVG={<IconThunder2Stroke />}
                        />
                      </Link>
                    </React.Fragment>
                  )}

                  <Link to="/firmware-update" className="list-link">
                    <NavigationButton
                      selected={currentPage === "/firmware-update"}
                      drawerWidth={drawerWidth}
                      onClick={() => setCurrentPage("/firmware-update")}
                      showNotif={showNotif != 0 ? (showNotif > 0 ? true : false) : false}
                      buttonText={"Firmware <br>Update"}
                      icoSVG={<IconMemory2Stroke />}
                    />
                  </Link>
                </>
              )}
              <Link to="/keyboard-select" className="list-link">
                <NavigationButton
                  keyboardSelectText={connected ? i18n.app.menu.selectAnotherKeyboard : i18n.app.menu.selectAKeyboard}
                  drawerWidth={drawerWidth}
                  selected={currentPage === "/keyboard-select"}
                  onClick={() => setCurrentPage("/keyboard-select")}
                  buttonText={"Keyboard <br>Selection"}
                  icoSVG={<IconKeyboardSelector />}
                />
              </Link>
              <Link to="/preferences" className="list-link">
                <NavigationButton
                  drawerWidth={drawerWidth}
                  selected={currentPage === "/preferences"}
                  onClick={() => setCurrentPage("/preferences")}
                  buttonText={"Preferences"}
                  icoSVG={<IconPreferences2Stroke />}
                />
              </Link>
              {/* <OverlayTrigger
                rootClose
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={this.renderTooltip("Update Bazecor")}
              >
                <div className="list-link">
                  <SoftwareUpdateMenuItem
                    keyboardSelectText={i18n.app.menu.softwareUpdate}
                    drawerWidth={drawerWidth}
                    selected={currentPage === "/software-update"}
                    onClick={event => event.stopPropagation()}
                  />
                </div>
              </OverlayTrigger> */}
              {/* <OverlayTrigger
                rootClose
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={this.renderTooltip("Exit Bazecor")}
              >
                <div className="list-link">
                  <ExitMenuItem
                    drawerWidth={drawerWidth}
                    onClick={() => remote.app.exit(0)}
                  />
                </div>
              </OverlayTrigger> */}
            </div>
          </Nav>
        </Navbar>
      </Styles>
    );
  }
}
MainMenu.propTypes = {
  connected: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  pages: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired
};

export default withRouter(MainMenu);
