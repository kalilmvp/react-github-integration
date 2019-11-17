import React, { Component } from "react";
import { FaGithubAlt, FaPlus, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";

import { Form, SubmitButton, List, MessageError } from "./styles";
import Container from "../../components/Container";
import api from "../../services/api";

export default class Main extends Component {
  state = {
    newRepo: "",
    repositories: [],
    loading: false,
    error: false,
    txtError: "",
  };

  componentDidMount() {
    const repositories = localStorage.getItem("repositories");

    if (repositories)
      this.setState({
        repositories: JSON.parse(repositories),
      });
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem("repositories", JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({
      newRepo: e.target.value,
    });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRepo, repositories } = this.state;

    try {
      // Check empty input
      if (newRepo === "") {
        this.setState({
          txtError: "You need to enter a valid GitHub repository",
        });
        throw new Error("You need to enter a valid GitHub repository");
      }

      const repoFound = repositories.find(r => r.name === newRepo);
      if (repoFound) {
        this.setState({
          txtError: "Repository already added",
        });
        throw new Error("Repository already added");
      }

      const response = await api.get(`repos/${newRepo}`);
      const data = {
        name: response.data.full_name,
      };

      this.setState({
        newRepo: "",
        repositories: [...repositories, data],
        loading: false,
        error: false,
        txtError: "",
      });
    } catch (err) {
      console.log(err);
      this.setState({
        loading: false,
        error: true,
        txtError: err.message,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, error, txtError } = this.state;
    return (
      <>
        <Container>
          <h1>
            <FaGithubAlt />
            Repositories
          </h1>

          <Form onSubmit={this.handleSubmit} error={error}>
            <input
              type="text"
              placeholder="Add Repository"
              value={newRepo}
              onChange={this.handleInputChange}
            />
            <SubmitButton loading={loading ? 1 : 0}>
              {loading ? (
                <FaSpinner color="#FFF" size={14} />
              ) : (
                <FaPlus color="#FFF" size={14} />
              )}
            </SubmitButton>
          </Form>

          <MessageError>{txtError}</MessageError>

          <List>
            {repositories.map(repo => (
              <li key={repo.name}>
                <span>{repo.name}</span>
                <Link to={`/repository/${encodeURIComponent(repo.name)}`}>
                  Details
                </Link>
              </li>
            ))}
          </List>
        </Container>
      </>
    );
  }
}
