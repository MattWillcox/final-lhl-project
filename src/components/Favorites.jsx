import React, { Component } from 'react'
import $ from 'jquery'
import axios from 'axios'
import querystring from 'querystring'
import logo from './static_html/logo-nearhere-bulma-green.png'
import { Redirect, Link } from 'react-router-dom';

const URL = 'http:\//localhost:3000/favorites/all';

export class Favorites extends Component {

  constructor(props){
    super(props)
    this.state = {
      favorites: [],
      favoritesObj: {},
      selection: '',
      mapTime: false
    }
    this.changeSelection = this.changeSelection.bind(this);
    this.deleteFavorite = this.deleteFavorite.bind(this);
    this.viewMap = this.viewMap.bind(this);
  }

  componentDidMount(){
    $.ajax({
      url: URL,
      cache:false,
      data: {user: sessionStorage.getItem('token')}
    }).done((data) => {
      // Build the incoming data into an object keyed by search query
      let favoritesObj = {};
      for (let result of data) {
        if(favoritesObj[result['query']]) {
          favoritesObj[result['query']].push(result);
        } else {
          favoritesObj[result['query']] = [result];
        }
      }
      const selection = Object.keys(favoritesObj)[0];
      this.setState({favoritesObj: favoritesObj, selection: selection});
    });
  }

  deleteFavorite(e){
    let favoriteID = e.target.name;
    let query = e.target.dataset.query;
    axios.delete('/favorites/remove/', {params:
      {
        user: sessionStorage.getItem('token'),
        place_id: favoriteID
      }
    })
    .then((result) => {
      let favoritesObj = this.state.favoritesObj;
      favoritesObj[query] = favoritesObj[query].filter((favorite) => {
        return (favorite.place_id !== favoriteID);
      });
      if (favoritesObj[query].length === 0) {
        delete favoritesObj[query];
        const selection = Object.keys(favoritesObj)[0];
        this.setState({favoritesObj: favoritesObj, selection: selection});
      } else {
        this.setState({favoritesObj: favoritesObj});        
      }
    })
  }

  viewMap(e){
    let favoriteID = e.target.name;
    axios.post('/favorites/setfavorite', querystring.stringify({
      user: sessionStorage.getItem('token'),
      place_id: favoriteID
    }))
    .then(() => {
      this.setState({mapTime: true});
    })
  }

  toggle() {
    $('.dropdown').toggleClass('is-active');
  }

  changeSelection(event) {
    const query = event.target.value;
    this.setState({selection: query});
    this.toggle();
    event.preventDefault();
  }

  render() {

    if (this.state.mapTime) {
      return (
        <Redirect to="/favoritesmap"/>
      )
    }  

    if (!sessionStorage.getItem('token')) {
      return(
        <Redirect to="/" />
      )
    }

    const style = {
      margin: 'auto',
      width: 'fit-content',
      textAlign: 'left',
      backgroundColor: '#e6fff2'
    }

    const boxStyle = {
      marginTop: '14px'
    }

    const buttonMargin = {
      marginRight: '4px'
    }

    const headerStyle = {
      marginTop: '14px'
    }

    const bottompadding = {
      paddingBottom: "2.0rem"
    }

    const link = {
      textDecoration: "underline",
      color: "#2a61ba"
    }

    const dropDownMenu = Object.keys(this.state.favoritesObj).map((query, i) => {
      return (
        <div className="dropdown-item" key={i}>
          <input
            className='button is-info is-outlined'
            type='button'
            value={query}
            onClick={this.changeSelection}
          />
        </div>
      )
    });

    let favoritesList;
    if (this.state.selection) {
      favoritesList = this.state.favoritesObj[this.state.selection].map((favorite, i) => {
        return (
          <div>
            <div className='box' style={boxStyle}>
              <h4>{favorite.name}</h4>
              <h6>{favorite.address}</h6>
              <input
                style={buttonMargin}
                className='button is-success'
                name={favorite.place_id}
                type='button'
                value='View Map'
                onClick={this.viewMap}
              />
              <input
                className='button is-danger'
                name={favorite.place_id}
                data-query={favorite.query}
                type='button'
                value='Remove'
                onClick={this.deleteFavorite}
              />
            </div>
          </div>
        );
      });
    } 

    if (!this.state.selection) {
      return (
        <section className="hero is-fullheight is-primary is-bold">
          <div className="hero-body">
            <div className='content box' style={style}>
              <p className="is-size-4">You have no favorites. Please go to the <Link to="/map"><span style={link}>map</span></Link> to add some!</p>
            </div>
          </div>
        </section>
      )
    } else {
      return(
        <section className="hero is-fullheight is-primary is-bold">
          <div className="hero-body">
            <div className='content box' style={style}>
              <div className="dropdown">
                <div className="dropdown-trigger">
                  <button className="button" aria-haspopup="true" aria-controls="dropdown-menu" onClick={this.toggle}>
                    <span>Which location?</span>
                    <span className="icon is-small">
                      <i className="fa fa-angle-down" aria-hidden="true"></i>
                    </span>
                  </button>
                </div>
                <div className="dropdown-menu" id="dropdown-menu" role="menu">
                  <div className="dropdown-content">
                    {dropDownMenu}
                  </div>
                </div>
              </div>
              <h2 className='query_header' style={headerStyle}>{this.state.selection}</h2>
              {favoritesList}
            </div>
          </div>
        </section>
      );
    }
  }
}

export default Favorites;