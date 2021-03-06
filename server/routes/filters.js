const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');

module.exports = (knex) => {

  const getFiltersPromise = (user_id) => {
    return new Promise((resolve, reject) => {
      knex('users_filters')
      .join('filters', 'filters.id', '=', 'users_filters.filter_id')
      .join('users', 'users.id', '=', 'users_filters.user_id')
      .select(['filters.id', 'filters.name'])
      .where('users.id', '=', user_id)
      .then((filters) => {
        resolve(filters);
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

  async function getFilters(user_id) {
    const filters = await getFiltersPromise(user_id);
    return filters;
  }

  const getFilterIdPromise = (filter) => {
    return new Promise((resolve, reject) => {
      knex('filters')
      .select('id')
      .where('name', '=', filter)
      .then((result) => {
        if(result.length > 0){
          resolve(result[0].id);
        } else {
          resolve(0);
        }
      })
      .catch((error) => {
        reject(error);
      })
    });
  }

  async function getFilterId(filter) {
    const filter_id = await getFilterIdPromise(filter);
    return filter_id;
  }

  const insertIntoFiltersPromise = (filter) => {
    return new Promise((resolve, reject) => {
      knex('filters')
        .returning('id')
        .insert({name: filter})
        .then((id) => {
          resolve(id);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async function insertIntoFilters(filter) {
    const filter_id = await insertIntoFiltersPromise(filter);
    return filter_id;
  }

  const getUsersFiltersIdPromise = (filter_id, user_id) => {
    return new Promise((resolve, reject) => {
      knex('users_filters')
      .select('id')
      .where('user_id', '=', user_id)
      .andWhere('filter_id', '=', filter_id)
      .then((result) => {
        if(result.length > 0){
          resolve(result[0].id);
        } else {
          resolve(0);
        }
      })
      .catch((error) => {
        reject(error);
      })
    });
  }

  async function getUsersFiltersId(filter_id, user_id) {
    const users_filters_id = await getUsersFiltersIdPromise(filter_id, user_id);
    return users_filters_id;
  }

  const insertIntoUsersFiltersPromise = (filter_id, user_id) => {
    return new Promise((resolve, reject) => {
      knex('users_filters')
        .insert({user_id: user_id, filter_id: Number(filter_id)})
        .then(() => {
          resolve(filter_id);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async function insertIntoUsersFilters(filter_id, user_id) {
    const filt_id = await insertIntoUsersFiltersPromise(filter_id, user_id);
    return filt_id;
  }

  router.delete('/:id', (req, res) => {
    const user_id = jwt.verify(req.body.user, 'CBFC').user;
    knex('users_filters').where('filter_id', req.params.id).andWhere('user_id', user_id).del()
    .then((results) => {
      knex('users_filters')
        .join('filters', 'filters.id', '=', 'users_filters.filter_id')
        .select(['filters.name', 'filters.id'])
        .where('users_filters.user_id', user_id)
        .then((filters) => {
          res.json(filters);
        });
    }).catch((error) => {
      console.log(error);
    });
  });


  router.get("/",  async (req, res) => {
    const decoded = jwt.verify(req.query.user, 'CBFC');
    const user_id = decoded.user;
    console.log('user_id: ', user_id, ' type: ', typeof user_id);

    const filters = await getFilters(user_id);
    res.json(filters);
  });

  router.post("/", async (req, res) => {

    const user_id = jwt.verify(req.body.user, 'CBFC').user;
    console.log('user_id: ', user_id, ' type: ', typeof user_id);

    const filter = req.body.filter.toLowerCase();

    let filter_id = await getFilterId(filter);

    if (filter_id === 0) {
      filter_id = await insertIntoFilters(filter);
    }

    const users_filters_id = await getUsersFiltersId(Number(filter_id), user_id);

    let filt_id;

    if (users_filters_id === 0) {
      filt_id = await insertIntoUsersFilters(Number(filter_id), user_id);
    } else {
      filt_id = 0;
    }

    res.json(filt_id);
  });

  return router;
}
