import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import login from "../../assets/images/login.png";
import avatar from "../../assets/images/avatar.png";
import { Grid, Paper, TextField, Button, Typography } from "@material-ui/core";
import LoggedOutNavbar from "../../component/loggedoutNavbar";
import Cookies from "universal-cookie";
import { useDispatch } from "react-redux";
import { logging } from "../../redux/Actions/login";
import api from "../../Apis/api";
import { useStyles } from "./loginCSS";

function Login() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const classes = useStyles();

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    setErrors(errors);
    if (errors) return;

    api
      .post()
      .authenticateUser({
        email: data.email,
        password: data.password,
      })
      .then(function (response) {
        dispatch(
          logging({
            userType: response.data.userType,
            userToken: response.data.userToken,
            userId: response.data.userId,
          })
        );
        const cookies = new Cookies();
        cookies.set(
          "Auth",
          {
            userType: response.data.userType,
            userToken: response.data.userToken,
            userId: response.data.userId,
          },
          { path: "/" }
        );

        history.push("/home");
      })
      .catch(function (error) {
        setErrors({
          email: "Email / Password is invalid",
          password: "Email / Password is invalid",
        });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...data };
    updatedData[name] = value;
    setData(updatedData);
    const error = validateField(name, value);
    const updatedErrors = { ...errors };
    updatedErrors[name] = error;
    setErrors(updatedErrors);
  };

  const validateField = (fieldName, fieldValue) => {
    var error = "";

    if (
      fieldName === "email" &&
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        fieldValue.trim()
      )
    ) {
      error = "Email is either empty or invalid";
    } else if (fieldName === "password" && !fieldValue) {
      error = "Password cannot be empty";
    }

    return error === "" ? null : error;
  };

  const validate = () => {
    const errors = {};

    if (
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        data.email.trim()
      )
    ) {
      errors.email = "Email is either empty or invalid";
    }
    if (!data.password) {
      errors.password = "Password cannot be empty";
    }

    return Object.keys(errors).length === 0 ? null : errors;
  };

  return (
    <>
      <LoggedOutNavbar />

      <Grid container className={classes.container}>
        <Grid
          item
          md={6}
          className={classes.image}
          container
          justify="center"
          alignItems="center"
        >
          <img src={login} alt="#" />
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          container
          justify="center"
          alignItems="center"
        >
          <Paper className={classes.paperStyle} elevation={5}>
            <Grid align="center">
              <img alt="" src={avatar} width="80px" />
              <h2 sclassName={classes.margin}>Sign In</h2>
            </Grid>

            <TextField
              label="Email"
              placeholder="Enter your email"
              type="email"
              fullWidth
              variant="outlined"
              className={classes.margin}
              name="email"
              value={data.email}
              onChange={handleChange}
              error={errors && errors.email}
              helperText={errors && errors.email ? errors.email : null}
            />

            <TextField
              label="Password"
              placeholder="Enter your password"
              type="password"
              fullWidth
              variant="outlined"
              className={classes.margin}
              name="password"
              value={data.password}
              onChange={handleChange}
              error={errors && errors.password}
              helperText={errors && errors.password ? errors.password : null}
            />

            <Typography className={classes.margin} align="right">
              <Button
                size="small"
                onClick={(e) => {
                  history.push("/ForgotPassword");
                }}
              >
                Forgot password
              </Button>
            </Typography>
            <Button
              variant="contained"
              className={classes.button}
              type="submit"
              onClick={handleSubmit}
            >
              Login
            </Button>

            <Grid align="center">
              <Typography className={classes.margin}>
                <p>
                  New user ?
                  <Button
                    size="small"
                    onClick={(e) => {
                      history.push("/Options");
                    }}
                  >
                    Sign up
                  </Button>
                </p>
              </Typography>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

export default Login;
