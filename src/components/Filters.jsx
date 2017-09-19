import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom'
import $ from 'jquery'
import SearchContainer from './SearchContainer.jsx';

const URL = "http:\//localhost:3001/filters";


class Filters extends Component {
  constructor(props){
    super(props)
    this.state = {
      filters : [],
      colors: ['#6DAD48', '#F2A435', '#2F8DF5', '#EEDE85', '#7D74F3']
    }
    this.addFilter = this.addFilter.bind(this);
    this.deleteFilter = this.deleteFilter.bind(this);
    this.filterCount = this.filterCount.bind(this);
  }

  filterCount() {
    return this.state.filters.length;
  }

  componentDidMount() {
    $.ajax({
      url: URL,
      cache:false,
      data: {user: localStorage.getItem('token')}
    }).done((data) => {
      const newFilters = this.state.filters.concat(data);
      this.setState({filters: newFilters});
    });
  }

  addFilter(e) {
    const newFilter = {name: this.filter.value};
    if (this.filterCount() === 5) {
      alert("Please only use 5 filters at a time");
    } else if (!newFilter.name) {
      alert("Please enter something");
    } else {
      this.filter.value = '';
      $.post(URL, {user: localStorage.getItem('token'), filter: newFilter.name})
        .done((data) => {
          if (data) {
            newFilter['id'] = data;
            const newFilters = this.state.filters.concat(newFilter);
            $(".submit-button").closest('form').find("input[name=filter]").val("");
            this.setState({filters: newFilters});
          } else {
            alert('You already have that filter');
          }
        })
        .fail((error) => {
          // alert(error.responseText);
        });
    }
    e.preventDefault();
  }

  deleteFilter(e) {
    const deleteURL = URL + `/${e.target.name}`;
    let newFilters = this.state.filters;
    $.ajax({
      url: deleteURL,
      type: 'DELETE',
      data: {user: localStorage.getItem('token')},
    }).done((data) => {
      newFilters = data;
      this.setState({filters: newFilters});
    }).fail((error) => {
      alert(error.responseText);
    });
    e.preventDefault();
  }

  render() {

    if (!localStorage.getItem('token')) {
      return(
        <Redirect to="/login" />
      )
    }

    const style = {
      width: 'auto',
      height: 'max-content',
      textAlign: 'center'
    }

    const inputStyle = {
      // width: '35%'
      'margin-bottom': '18.76px'
    }

    const filterStyle = {
      margin: '18.76px 5px 0 5px'
    }

    const filterSpan = this.state.filters.map((filter, i) => {
      const normalized = filter.name[0].toUpperCase().concat(filter.name.slice(1).toLowerCase());

      return (
        <span className='tag is-large is-danger' key={i} style={filterStyle} >
          {normalized}
          <button className='delete is-medium' name={filter.id} onClick={this.deleteFilter}></button>
        </span>
      );
    })

    return (
      <div className='box' style={style}>
        <h1>What Are You Looking For?</h1>
        <form className="filters" onSubmit={this.addFilter}>
          <div>
            <input
              className='input is-primary'
              style={inputStyle}
              type='text'
              name="filter"
              placeholder="Food, Fashion, Fitness..."
              ref={(filter) => this.filter = filter}
            />
          </div>
          <div>
            <input className="button is-info" type="submit" value='Add Filter' />
          </div>
        </form>
        {filterSpan}
        <SearchContainer filterCount={this.filterCount}/>
      </div>
    );
  }
}

export default Filters;
