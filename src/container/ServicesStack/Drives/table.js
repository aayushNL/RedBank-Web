import React, { useState, useEffect } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core/";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../Apis/api";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontWeight: "bold",
    fontSize: 16,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
}));

export default function CollapsibleTable() {
  const classes = useStyles();
  const history = useHistory();
  const [drivesList, setList] = useState([]);
  const [donorsList, setDonors] = useState([]);
  const [driveId, setDriveId] = useState("");
  const loggedInState = useSelector((state) => state.loggedIn);

  useEffect(() => {
    api
      .get()
      .fetchDrives({
        headers: {
          Authorization: "Bearer " + loggedInState.userToken,
        },
      })
      .then((response) => {
        console.log(response.data);
        if (response.data) {
          setList(response.data);
        }
      });

    setDonors([]);
  }, [loggedInState]);

  const handleDonorsList = (driveId) => {
    api
      .get()
      .fetchDriveDonorList(driveId, {
        headers: {
          Authorization: "Bearer " + loggedInState.userToken,
        },
      })
      .then((response) => {
        if (response.data[0]) {
          setDriveId(driveId);
          setDonors(response.data);
        }
      });
  };

  const handleCancel = (idx, driveId) => {
    api
      .put()
      .cancelDrive(
        {
          driveId: driveId,
        },
        {
          headers: {
            Authorization: "Bearer " + loggedInState.userToken,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          const updatedList = [...drivesList];
          updatedList[idx].status = false;
          setList(updatedList);
        }
      });
  };

  useEffect(() => {
    if (donorsList.length !== 0) {
      history.push({
        pathname: "/acceptedDonors",
        donorsList,
        driveId,
        setDonors,
      });
    }
  }, [donorsList]);

  return (
    <>
      <TableContainer component={Paper} className={classes.root}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Drive Id</StyledTableCell>
              <StyledTableCell align="center">Date</StyledTableCell>
              <StyledTableCell align="center">Time</StyledTableCell>
              <StyledTableCell align="center" style={{ width: "30%" }}>
                Address
              </StyledTableCell>
              <StyledTableCell align="center">
                Blood Groups Invited
              </StyledTableCell>
              <StyledTableCell align="center">Donors List</StyledTableCell>
              <StyledTableCell align="center">Status</StyledTableCell>
              <StyledTableCell align="center">Cancel drive</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivesList.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell align="center">{row.driveId}</TableCell>
                <TableCell align="center">
                  {row.startTimestamp.split("T")[0]} to{" "}
                  {row.endTimestamp.split("T")[0]}
                </TableCell>
                <TableCell align="center">
                  {row.startTimestamp.split("T")[1].split(":")[0]} :
                  {row.startTimestamp.split("T")[1].split(":")[1]} to{" "}
                  {row.endTimestamp.split("T")[1].split(":")[0]} :
                  {row.endTimestamp.split("T")[1].split(":")[1]}
                </TableCell>
                <TableCell align="center">
                  {row.address}, {row.district}, {row.state}, {row.pincode}
                </TableCell>
                <TableCell align="center">{row.bloodGroups}</TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    onClick={(e) => {
                      handleDonorsList(row.driveId);
                    }}
                  >
                    View list
                  </Button>
                </TableCell>
                <TableCell align="center">
                  {!drivesList[idx].status ? (
                    <p style={{ color: "red" }}>Canceled</p>
                  ) : new Date(row.endTimestamp).getTime() <=
                    new Date().getTime() ? (
                    <p style={{ color: "grey" }}>Completed</p>
                  ) : new Date(row.startTimestamp).getTime() >=
                    new Date().getTime() ? (
                    <p style={{ color: "#007CFF" }}> Upcoming</p>
                  ) : (
                    <p style={{ color: "green" }}> Active </p>
                  )}
                </TableCell>
                <TableCell align="center">
                  {new Date(row.endDate).getTime() <= new Date().getTime() ? (
                    <p>N/A</p>
                  ) : row.status ? (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        handleCancel(idx, drivesList[idx].driveId);
                      }}
                      style={{ backgroundColor: "#E94364", color: "white" }}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <p style={{ color: "red" }}>Canceled</p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
