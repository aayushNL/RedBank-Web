import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  makeStyles,
  Button,
  ButtonGroup,
  Typography,
  FormControl,
  Divider,
  FormHelperText,
  Container,
  InputLabel,
  Select,
  MenuItem,
  Input,
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  CardMedia,
} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import states from "../../assets/json/statesWithoutAll.json";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import LockSharpIcon from "@material-ui/icons/LockSharp";
import EditIcon from "@material-ui/icons/Edit";
import SaveRoundedIcon from "@material-ui/icons/SaveRounded";
import CancelIcon from "@material-ui/icons/Cancel";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import individual from "../../assets/images/indDp.jpg";
import api from "../../Apis/api";

const useStyles = makeStyles((theme) => ({
  fonts:{
    [theme.breakpoints.down("xs")]:{
      fontSize: "12px",
    }
  },
  imgEligible:{
    marginBottom: "20px",
    height: 200,
    width: 200,
    marginLeft: "110px",
    borderRadius: "100px",
    border: "5px #E94364 solid",
    [theme.breakpoints.down("xs")]:{
      marginLeft: "50px",
      width: 120,
      height: 120,
    }
  },
  imgNonEligible:{
    marginBottom: "20px",
    height: 200,
    width: 200,
    marginLeft: "110px",
    borderRadius: "100px",
    border: "5px #CCCCCC solid",
    [theme.breakpoints.down("xs")]:{
      marginLeft: "50px",
      width: 120,
      height: 120,
    }
  },
  container: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(3),
    [theme.breakpoints.down("xs")]:{
      padding: theme.spacing(2)
    }
  },
}));

function IndProfile() {
  const [initialValues, setInitialValues] = useState({
    name: "",
    userId: "",
    donorStatus: 0,
    lastDonationDate: null,
  });
  const loggedInState = useSelector((state) => state.loggedIn);

  const [fulldata, setfulldata] = useState({
    email: "",
    phone: "",
    bloodGroup: "",
    dob: "",
    address: "",
    state: "",
    district: "",
    pincode: "",
    donationMade: "",
    drivesAttended: "",
    drivesMade: "",
    commitmentMade: "",
  });

  const [errors, setError] = useState({
    phone: "",
    bloodGroup: "",
    dob: "",
    address: "",
    state: "",
    district: "",
    pincode: "",
    password: "",
    cpassword: "",
  });

  const validate = () => {
    const errors = {};

    if (fulldata.bloodGroup === "") {
      errors.bloodGroup = "Blood Group cannot be empty";
    }

    if (fulldata.address.trim() === "") {
      errors.address = "Address cannot be empty";
    }
    if (fulldata.state === "") {
      errors.state = "State cannot be empty";
    }
    if (fulldata.district === "") {
      errors.district = "District cannot be empty";
    }
    if (!/^[1-9][0-9]{5}$/.test(fulldata.pincode.trim())) {
      errors.pincode = "Invalid pincode format";
    }
    if (!/^\d{10}$/.test(fulldata.phone.trim())) {
      errors.phone = "Invalid Phone number";
    }

    return Object.keys(errors).length === 0 ? null : errors;
  };

  const validatePass = () => {
    const strongRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
    );
    const errors = {};
    if (!strongRegex.test(newPass.password.trim())) {
      errors.password = "Enter a stronger password";
    }
    if (newPass.cpassword !== newPass.password || newPass.cpassword === "") {
      errors.cpassword = "Password is either empty or Passwords do not match";
    }
    return Object.keys(errors).length === 0 ? null : errors;
  };

  const [enable, setEnable] = useState(true);
  const [selectedStateIndex, setSelectedStateIndex] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...fulldata };

    if (name === "state") {
      setEnable(false);
      const idx = states.states.findIndex((item) => item.state === value);
      setSelectedStateIndex(idx);
      updatedData.district = states.states[idx].districts[0];
    }

    updatedData[name] = value;
    setfulldata(updatedData);
  };

  useEffect(() => {
    api
      .get()
      .fetchUserProfile({
        headers: {
          Authorization: "Bearer " + loggedInState.userToken,
        },
      })
      .then((response) => {
        setInitialValues(response.data);

        if (initialValues.lastDonationDate && initialValues.donorStatus === 2) {
          const lastDonationDate = initialValues.lastDonationDate;

          const eligible =
            (new Date().getTime() -
              new Date(lastDonationDate.split("T")[0]).getTime()) /
              (1000 * 60 * 60 * 24) >
            56;
          if (eligible) {
            setInitialValues((prevState) => ({ ...prevState, donorStatus: 0 }));
          }
        }
      })
      .catch();
    anotherAxios();
  }, [loggedInState]);

  const handleStatus = async (status) => {
    const newStatus = await api.put().setDonorStatus(
      { donorStatus: status },
      {
        headers: {
          Authorization: "Bearer " + loggedInState.userToken,
        },
      }
    );
    setInitialValues((prevState) => ({
      ...prevState,
      donorStatus: newStatus.data.donorStatus,
    }));
  };

  const anotherAxios = () => {
    api
      .get()
      .fetchUserData({
        headers: {
          Authorization: "Bearer " + loggedInState.userToken,
        },
      })
      .then((response) => {
        setfulldata(response.data);
      })
      .catch();
  };

  const classes = useStyles();
  const [values, setValues] = useState(initialValues);

  // For Editing
  const [enableReadOnly, setEdit] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    const errors = validate();
    setError(errors);
    if (errors) return;

    api
      .put()
      .updateIndProfile(fulldata, {
        headers: {
          Authorization: "Bearer " + loggedInState.userToken,
        },
      })
      .then((response) => {
        setOpenSave(true);
        setEdit(true);
      })
      .catch();
  };

  const [verify, setVerify] = useState(true);
  const [currPassword, checkPass] = useState("");
  const [currPasswordError, checkPassError] = useState("");

  const verifyPassword = () => {
    api
      .post()
      .verifyCurrPassword(
        {
          currentPassword: currPassword,
        },
        {
          headers: {
            Authorization: "Bearer " + loggedInState.userToken,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          checkPassError("");
          checkPass("");
          handleClickOpen();
        } else {
          checkPassError("Incorrect Password");
        }
      })
      .catch();
  };

  // Change passsword state
  const [newPass, changePass] = useState({
    password: "",
    cpassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const newState = { ...newPass };
    newState[name] = value;
    changePass(newState);
  };

  const changePassword = (e) => {
    const errors = validatePass();
    setError(errors);

    if (errors) {
      return;
    }

    api
      .put()
      .changePassword(
        {
          newPassword: newPass.password,
        },
        {
          headers: {
            Authorization: "Bearer " + loggedInState.userToken,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          setVerify(true);
          handleClose();
          setOpenSave(true);
        }
      })
      .catch();
  };

  //  for modal for edit
  const [openEdit, setOpenEdit] = React.useState(false);

  const handleClickOpenEdit = () => {
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  //  for modal for Save, password changes successfully
  const [openSave, setOpenSave] = React.useState(false);

  const handleCloseSave = () => {
    setOpenSave(false);
  };

  // Modal for Change Password
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    changePass({
      password: "",
      cpassword: "",
    });
    setOpen(false);
  };

  return (
    <>
      <Grid container className={classes.container}>
        <Grid item md={6} xs={12}>
          <Grid container>
            <Grid item xs={12}>
              <CardMedia
                image={initialValues.profilePicture || individual}
                className={initialValues.donorStatus === 1 ?(classes.imgEligible):(classes.imgNonEligible)}
                component="img"
              />
            </Grid>

            <Grid item xs={6}>
              <Typography className={classes.fonts} variant="h6">Name : </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.fonts} variant="h6">{initialValues.name}</Typography>
            </Grid>

            {/* unique id */}
            <Grid item xs={6}>
              <Typography className={classes.fonts} variant="h6">Unique Id :</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.fonts} variant="h6">{initialValues.userId}</Typography>
            </Grid>

            {/* donor status */}
            <Grid item xs={6}>
              <Typography className={classes.fonts} variant="h6">Donor Status :</Typography>
            </Grid>
            <Grid item xs={6}>
              {initialValues.donorStatus === 0 ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    handleStatus(1);
                  }}
                  endIcon={<CancelIcon />}
                >
                  {" "}
                  Inactive
                </Button>
              ) : initialValues.donorStatus === 1 ? (
                <Button
                  style={{
                    backgroundColor: "#E94364",
                    color: "white",
                  }}
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    handleStatus(0);
                  }}
                  endIcon={<CheckCircleIcon />}
                >
                  Active
                </Button>
              ) : (
                <Button size="small" disabled={true}>
                  Not Eligible
                </Button>
              )}
            </Grid>

            {/* user statistics */}
            <Grid item xs={12} style={{ padding: "7px" }}>
              <Typography className={classes.fonts}
                style={{ marginTop: "20px", fontWeight: "bold" }}
                variant="h5"
              >
                Your Stats
              </Typography>
            </Grid>
            <Grid item xs={9}>
              {" "}
              <Divider />
            </Grid>
            {/* commitments */}
            <Grid item xs={6} style={{ padding: "7px" }}>
              <Typography className={classes.fonts} variant="h6">Commitments made :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "7px" }}>
              <Typography className={classes.fonts} variant="h6" color="secondary">
                {fulldata.commitmentMade}
              </Typography>
            </Grid>

            {/* donations made */}
            <Grid item xs={6} style={{ padding: "7px" }}>
              <Typography className={classes.fonts} variant="h6">Donations made :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "7px" }}>
              <Typography className={classes.fonts} variant="h6" color="secondary">
                {fulldata.donationMade}
              </Typography>
            </Grid>

            {/* drives attended */}
            <Grid item xs={6} style={{ padding: "7px" }}>
              <Typography className={classes.fonts} variant="h6">Drives attended :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "7px" }}>
              <Typography className={classes.fonts} variant="h6" color="secondary">
                {fulldata.drivesAttended}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={6} xs={12} >
          <Grid item xs={12} style={{ padding: "10px" }}>
            <Typography className={classes.fonts}
              variant="h5"
              style={{ fontWeight: "bold" }}
            >About</Typography>
            <Divider />
          </Grid>

          <Grid  container justify="center">
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">Email :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">{fulldata.email}</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">DOB :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">{fulldata.dob.split("T")[0]}</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">Blood Group :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">{fulldata.bloodGroup}</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">Contact :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              {enableReadOnly ? (
                <Typography className={classes.fonts} variant="h6">{fulldata.phone}</Typography>
              ) : (
                <TextField
                  name="phone"
                  value={fulldata.phone}
                  onChange={handleChange}
                  inputProps={{
                    maxLength: 10,
                  }}
                  error={errors && errors.phone ? true : false}
                  helperText={errors && errors.phone ? errors.phone : null}
                />
              )}
            </Grid>

            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">Address :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              {enableReadOnly ? (
                <Typography className={classes.fonts} variant="h6">{fulldata.address}</Typography>
              ) : (
                <TextField
                  name="address"
                  value={fulldata.address}
                  onChange={handleChange}
                  error={errors && errors.address ? true : false}
                  helperText={errors && errors.address ? errors.address : null}
                />
              )}
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">State :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              {enableReadOnly ? (
                <Typography className={classes.fonts} variant="h6"> {fulldata.state}</Typography>
              ) : (
                <FormControl
                  variant="standard"
                  error={errors && errors.state ? true : false}
                >
                  <Select
                    name="state"
                    onChange={handleChange}
                    value={fulldata.state}
                  >
                    {states.states.map((item, id) => (
                      <MenuItem value={item.state} key={id}>
                        {item.state}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors && errors.state ? errors.state : null}
                  </FormHelperText>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">District :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              {enableReadOnly ? (
                <Typography className={classes.fonts} variant="h6"> {fulldata.district}</Typography>
              ) : (
                <FormControl
                  variant="standard"
                  error={errors && errors.district ? true : false}
                >
                  <Select
                    inputProps={{ readOnly: false }}
                    name="district"
                    onChange={handleChange}
                    value={fulldata.district}
                  >
                    {states.states[selectedStateIndex].districts.map(
                      (item, id) => (
                        <MenuItem value={item} key={id}>
                          {item}
                        </MenuItem>
                      )
                    )}
                  </Select>
                  <FormHelperText>
                    {errors && errors.district ? errors.district : null}
                  </FormHelperText>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              <Typography className={classes.fonts} variant="h6">Pincode :</Typography>
            </Grid>
            <Grid item xs={6} style={{ padding: "10px" }}>
              {enableReadOnly ? (
                <Typography className={classes.fonts} variant="h6"> {fulldata.pincode}</Typography>
              ) : (
                <TextField
                  name="pincode"
                  value={fulldata.pincode}
                  onChange={handleChange}
                  inputProps={{
                    maxLength: 6,
                  }}
                  error={errors && errors.pincode ? true : false}
                  helperText={errors && errors.pincode ? errors.pincode : null}
                />
              )}
            </Grid>
          </Grid>

          {/* Dialog for Edit and Change Password */}
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth={true}
          >
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter your new password and confirm it
              </DialogContentText>
              <TextField
                margin="dense"
                label=" New Password"
                name="password"
                type="password"
                value={newPass.password}
                onChange={handlePasswordChange}
                error={errors && errors.password ? true : false}
                helperText={errors && errors.password ? errors.password : null}
                fullWidth
              />
              <TextField
                margin="dense"
                label=" Confirm Password"
                name="cpassword"
                type="password"
                value={newPass.cpassword}
                onChange={handlePasswordChange}
                error={errors && errors.cpassword ? true : false}
                helperText={
                  errors && errors.cpassword ? errors.cpassword : null
                }
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={changePassword} color="primary">
                Submit
              </Button>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          {/* dialog for edit profile */}
          <Dialog open={openEdit} onClose={handleCloseEdit}>
            <DialogTitle>{"Start editing"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Go ahead, you can start editing
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  handleCloseEdit();
                  setEdit(false);
                }}
                color="primary"
                autoFocus
              >
                Got it
              </Button>
            </DialogActions>
          </Dialog>

          {/* dialog for save profile, password changed successfully */}
          <Dialog open={openSave} onClose={handleCloseSave}>
            <DialogTitle>{"Success"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                All changes saved successfully
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseSave} color="primary" autoFocus>
                Ok
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>

        <Grid item xs={12} style={{ marginTop: "20px" }}>
          <Divider />
          <Grid container align="center">
            {/* For Edit Button */}
            <Grid item xs={12}>
              {enableReadOnly ? (
                <Button onClick={handleClickOpenEdit} endIcon={<EditIcon />}>
                  Edit profile
                </Button>
              ) : (
                <Button onClick={handleSave} endIcon={<SaveRoundedIcon />}>
                  Save Changes
                </Button>
              )}
            </Grid>
            <Grid item xs={12}>
              {verify ? (
                <>
                  <Button
                    onClick={() => {
                      setVerify(false);
                    }}
                    endIcon={<LockSharpIcon />}
                  >
                    Change your password
                  </Button>
                </>
              ) : (
                <>
                  <Typography>Confirm Your Password :</Typography>
                  <TextField
                    name="password"
                    type="password"
                    value={currPassword}
                    onChange={(e) => {
                      checkPass(e.target.value);
                    }}
                    error={currPasswordError ? true : false}
                    helperText={currPasswordError ? currPasswordError : null}
                  />
                  <Button
                    onClick={() => {
                      verifyPassword();
                    }}
                  >
                    Verify
                  </Button>
                  <Button
                    onClick={() => {
                      checkPass("");
                      checkPassError("");
                      setVerify(true);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
export default IndProfile;