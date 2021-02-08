import React, { useState, useEffect } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import { Button } from "@material-ui/core/";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
import { useHistory } from "react-router-dom";

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

// const handleClick = (idx) => {
//   if (window.confirm("Are you sure ?")) {
//     const updatedList = [...state];
//     updatedList[index].acceptedDonors[idx].hasGivenBlood = true;
//     setList(updatedList);
//   }
// };

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
}));

export default function CollapsibleTable() {
  const [drivesList, setList] = useState([]);
  const [acceptedDonors, setDonors] = useState([]);
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    axios.get("http://localhost:5000/mydrives").then((response) => {
      if (response.data.success) {
        setList(response.data.driveData);
        console.log(response.data);
      }
    });

    setDonors([]);
  }, []);

  const handleClick = (driveId) => {
    // {
    //   headers: {
    //     Authorization: loggedState.userToken;
    //   }
    // }
    axios
      .post("http://localhost:5000/donorList", { driveId })
      .then((response) => {
        if (response.data.success) {
          setDonors(response.data.acceptedDonors);
        }
      });
  };

  // const handleCancel = (driveId) => {
  //   axios
  //     .post("http://localhost:5000/canceldrive", { driveId })
  //     .then((response) => {
  //       if (response.data.success) {
  //         setDonors(response.data.acceptedDonors);
  //       }
  //     });
  // };

  useEffect(() => {
    if (acceptedDonors.length !== 0) {
      history.push({
        pathname: "/acceptedDonors",
        acceptedDonors,
        setDonors,
      });
    }
  }, [acceptedDonors]);

  return (
    <TableContainer component={Paper} className={classes.root}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">Drive Id</StyledTableCell>
            <StyledTableCell align="center">Start Date</StyledTableCell>
            <StyledTableCell align="center">Start Time</StyledTableCell>
            <StyledTableCell align="center">End Date</StyledTableCell>
            <StyledTableCell align="center">End Time</StyledTableCell>
            <StyledTableCell align="center">Address</StyledTableCell>
            <StyledTableCell align="center">
              Blood Groups Invited
            </StyledTableCell>
            <StyledTableCell align="center">Donors List</StyledTableCell>
            <StyledTableCell align="center">Cancel drive</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivesList.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell align="center">{row.driveId}</TableCell>
              <TableCell align="center">{row.startDate}</TableCell>
              <TableCell align="center">{row.startTime}</TableCell>
              <TableCell align="center">{row.endDate}</TableCell>
              <TableCell align="center">{row.endTime}</TableCell>

              <TableCell align="center">
                {row.address}, {row.district}, {row.state}, {row.pincode}
              </TableCell>

              <TableCell align="center">{row.bloodGroupsInvited}</TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  onClick={(e) => {
                    handleClick(row.driveId);
                  }}
                >
                  View list
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  // onClick={(e) => {
                  //   handleCancel(row.driveId);
                  // }}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
