import React from 'react'
import app from 'xadmin'
import 'bootstrap/dist/css/bootstrap.min.css'
import routers, { Main, App, Page, Loading, Icon } from './layout'

import components from './components'

import form from './form'
import model from './model'
import relate from './model/relate'
import filter from './filter'
import auth from './auth'

export default {
  name: 'xadmin.ui.bootstrap',
  components: {
    Main, App, Page, Loading, Icon,
    ...components,
    ...form.components,
    ...model.components,
    ...filter.components,
    ...relate.components,
    ...auth.components
  },
  routers,
  form_fields: {
    ...form.form_fields,
    ...filter.form_fields,
    ...relate.form_fields
  }
}