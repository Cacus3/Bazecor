// -*- mode: js-jsx -*-
/* Bazecor -- Kaleidoscope Command Center
 * Copyright (C) 2018, 2019  Keyboardio, Inc.
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

import React, { useState } from "react";
const { clipboard } = require("electron");
const fs = require("fs");

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { toast } from "react-toastify";

import i18n from "../../../i18n";
import LoadDefaultKeymap from "./LoadDefaultKeymap";

export const ImportExportDialog = props => {
  const { toCloseImportExportDialog } = props;

  const [dataState, setData] = useState();

  /**
   * This is Hook that lets add React state "isChange" for change tracking in this dialog
   * @param {boolean} [initialState=false] - Sets initial state for "isChange"
   */
  const [isChange, setIsChange] = useState(false);

  const data =
    dataState != undefined
      ? dataState
      : JSON.stringify(
          {
            keymap: props.keymap,
            colormap: props.colormap,
            palette: props.palette
          },
          null,
          2
        );

  function onConfirm() {
    try {
      isChange ? props.onConfirm(JSON.parse(data)) : toCloseImportExportDialog();
      setData(undefined);
      setIsChange(false);
    } catch (e) {
      toast.error(e.toString());
    }
  }

  function onCancel() {
    setData(undefined);
    setIsChange(false);
    props.onCancel();
  }

  function copyToClipboard(data) {
    clipboard.writeText(data);
    toExport(data);
    setIsChange(false);
    toast.success(i18n.editor.copySuccess, {
      autoClose: 2000
    });
  }

  function pasteFromClipboard() {
    setData(clipboard.readText());
    toImport();
    setIsChange(true);
    toast.success(i18n.editor.pasteSuccess, {
      autoClose: 2000
    });
  }

  function loadDefault(path) {
    fs.readFile(path, "utf-8", (err, layoutData) => {
      if (err) {
        toast.error(err.toString(), {
          autoClose: 2000
        });
      }
      setData(layoutData);
    });
  }

  function toImport() {
    let options = {
      title: "Load Layers file",
      buttonLabel: "Load Layers",
      filters: [
        { name: "Json", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ]
    };
    const remote = require("electron").remote;
    const WIN = remote.getCurrentWindow();
    remote.dialog
      .showOpenDialog(WIN, options)
      .then(resp => {
        if (!resp.canceled) {
          console.log(resp.filePaths);
          let layers;
          try {
            layers = require("fs").readFileSync(resp.filePaths[0]);
            console.log(JSON.parse(layers).keymap[0].label);
            toast.success(i18n.editor.importSuccessAllLayers, {
              autoClose: 2000
            });
          } catch (e) {
            console.error(e);
            toast.error(i18n.errors.invalidLayerFile, {
              autoClose: 2000
            });
            return;
          }
          setData(layers);
        } else {
          console.log("user closed SaveDialog");
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  function toExport(data) {
    let options = {
      title: "Save Layers file",
      defaultPath: "Layers.json",
      buttonLabel: "Save Layers",
      filters: [
        { name: "Json", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ]
    };
    const remote = require("electron").remote;
    const WIN = remote.getCurrentWindow();
    remote.dialog
      .showSaveDialog(WIN, options)
      .then(resp => {
        if (!resp.canceled) {
          console.log(resp.filePath, data);
          require("fs").writeFileSync(resp.filePath, data);
          toast.success(i18n.editor.exportSuccessCurrentLayer, {
            autoClose: 2000
          });
        } else {
          console.log("user closed SaveDialog");
        }
      })
      .catch(err => {
        console.error(err);
        toast.error(i18n.errors.exportError + err, {
          autoClose: 2000
        });
      });
  }

  return (
    <Dialog disableBackdropClick open={props.open} onClose={onCancel} fullScreen>
      <DialogTitle>{i18n.editor.importExport}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{i18n.editor.importExportDescription}</Typography>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <LoadDefaultKeymap loadDefault={loadDefault} />
          <div>
            <Button color="primary" onClick={() => copyToClipboard(data)}>
              {"Export Layers"}
            </Button>
            <Button color="primary" onClick={pasteFromClipboard}>
              {"Import Layers"}
            </Button>
          </div>
        </div>
        <TextField
          disabled={props.isReadOnly}
          multiline
          fullWidth
          value={data}
          onChange={event => {
            setData(event.target.value);
            setIsChange(true);
          }}
          variant="outlined"
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onCancel}>
          Cancel
        </Button>
        <Button color="primary" onClick={onConfirm}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};
