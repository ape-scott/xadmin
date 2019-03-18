import React from 'react'
import _ from 'lodash'
import Icon from 'react-fontawesome'
import app from 'xadmin'
import { Nav, ButtonGroup, Card, Modal, Form, OverlayTrigger, Popover, Badge, Button, Col, Row, FormGroup, ControlLabel } from 'react-bootstrap'
import { BaseForm, reduxForm } from 'xadmin-form'
import { InlineGroup, SimpleGroup } from 'xadmin-form/lib/components/groups'

import { ModelWrap } from '../index'
import { getFieldProp } from '../utils'
import filter_converter from './filters'
import filter_fields from './fields'

const convert = (schema, options) => {
  const opts = options || {}
  return app.load_list('filter_converter').reduce((prve, converter) => {
    return converter(prve, schema, opts)
  }, {})
}

const FilterForm = (props) => {
  const { formKey, filters, fieldProps } = props
  const fields = filters.map(filter => {
    const field = convert(filter.schema, { key: filter.key })
    return _.merge(field, filter.field, fieldProps)
  })
  const WrapForm = reduxForm({ 
    form: formKey,
    destroyOnUnmount: false,
    enableReinitialize: true,
    onChange: (values) => console.log(values)
  })(BaseForm)
  return <WrapForm fields={fields} {...props}/>
}

class FilterComponent extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    return this.state != nextState
  }

}

class FilterDiv extends React.Component {

  render() {
    const { _t } = app.context
    const { filters, formKey, data, changeFilter, resetFilter } = this.props
    const FormLayout = (props) => {
      const { children, invalid, pristine, handleSubmit, submitting } = props
      return (
        <form className="form-horizontal" onSubmit={handleSubmit}>
          {children}
          <Row>
            <Col sm={9} xsOffset={3} >
              <Button disabled={invalid || submitting} onClick={handleSubmit}>{_t('Search')}</Button>
              {' '}
              <Button disabled={submitting} onClick={resetFilter} variant="light">{_t('Clear')}</Button>
            </Col>
          </Row>
        </form>
      )
    }
    return (<FilterForm
      formKey={formKey}
      filters={filters}
      component={FormLayout}
      initialValues={data}
      onSubmit={changeFilter}
      fieldProps={{ mode: 'base' }}
    />)
  }

}

class FilterInline extends React.Component {

  render() {
    const { _t } = app.context
    const { filters, formKey, data, changeFilter, resetFilter, groupSize, hasButtons } = this.props

    const FormLayout = (props) => {
      const { children, invalid, pristine, handleSubmit, submitting } = props
      return (
        <form className="form-horizontal" onSubmit={handleSubmit}>
          <Row style={{ marginBottom: '-5px' }}>
            {children}
          </Row>
          { hasButtons ? (
            <Row>
              <Col style={{ textAlign: 'center' }} sm={12}>
                <Button disabled={invalid || submitting} size="sm" onClick={handleSubmit}>{_t('Search')}</Button>
                {' '}
                <Button disabled={submitting} onClick={resetFilter} size="sm" variant="light">{_t('Clear')}</Button>
              </Col>
            </Row> 
          ): null }
        </form>
      )
    }

    return (<FilterForm
      formKey={formKey}
      filters={filters}
      component={FormLayout}
      initialValues={data}
      onSubmit={changeFilter}
      group={InlineGroup}
      fieldProps={{ attrs: { size: 'sm' }, mode: 'mini' }}
    />)
  }

}

@ModelWrap('model.list.filter')
class FilterMenu extends FilterComponent {

  render() {
    const { _t } = app.context
    const { filters, formKey, data, changeFilter, resetFilter } = this.props

    if(filters && filters.length) {
      const FormLayout = (props) => {
        const { children, invalid, pristine, handleSubmit, submitting } = props
        return (
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {children}
                <ButtonGroup className="w-100">
                  <Button disabled={submitting} onClick={resetFilter} variant="light">{_t('Clear')}</Button>
                  <Button disabled={invalid || submitting} onClick={handleSubmit}>{_t('Search')}</Button>
                </ButtonGroup>
              </Form>
            </Card.Body>
          </Card>
        )
      }
      return (<FilterForm
        formKey={formKey}
        filters={filters}
        component={FormLayout}
        initialValues={data}
        onSubmit={changeFilter}
        group={SimpleGroup}
      />)
    } else {
      return null
    }
  }

}

@ModelWrap('model.list.filter')
class FilterPopover extends FilterComponent {

  render() {
    const { _t } = app.context
    const { filters, data } = this.props
    if(filters && filters.length) {
      return (
        <OverlayTrigger trigger="click" rootClose={false} placement="bottom" overlay={
          <Popover style={{ maxWidth: 580 }}>
            <FilterDiv {...this.props}/>
          </Popover>}>
          <Nav.Link key="filter.popover"><Icon name="filter" /> {_t('Filter')} {(data && Object.keys(data).length) ? (<Badge>{Object.keys(data).length}</Badge>) : null}</Nav.Link>
        </OverlayTrigger>)
    } else {
      return null
    }
  }

}

@ModelWrap('model.list.filter')
class FilterModal extends FilterComponent {

  state = { show: false }

  onClose = () => {
    this.setState({ show: false })
  }
  
  render() {
    const { _t } = app.context
    const { filters, formKey, data, changeFilter, resetFilter } = this.props

    const FormLayout = (props) => {
      const { children, invalid, handleSubmit, submitting, onClose } = props
      const icon = submitting ? 'spinner fa-spin' : 'floppy-o'
      return (
        <Modal
          show={this.state.show} size="lg"
          onHide={this.onClose}
        >
          <Modal.Header closeButton>{_t('Filter Form')}</Modal.Header>
          <Modal.Body>
            <form className="form-horizontal">{children}</form>
          </Modal.Body>
          <Modal.Footer>
            <Button key={0} disabled={submitting} onClick={()=>{
              resetFilter()
              this.onClose()
            }} variant="light">{_t('Clear')}</Button>
            <Button key={1} disabled={invalid || submitting} onClick={()=>{
              handleSubmit()
              this.onClose()
            }}>{_t('Search')}</Button>  
          </Modal.Footer>
        </Modal>
      )
    }

    if(filters && filters.length) {
      return [
        (<Nav.Link key="filter.model" onClick={()=>this.setState({ show: true })}>
          <Icon name="filter" /> {_t('Filter')} {(data && Object.keys(data).length) ? (<Badge>{Object.keys(data).length}</Badge>) : null}
        </Nav.Link>),
        this.state.show ? (
          <FilterForm
            key={`filterForm-${formKey}`}
            formKey={formKey}
            filters={filters}
            component={FormLayout}
            initialValues={data}
            onSubmit={changeFilter}
            fieldProps={{ mode: 'base' }}
          />) : null
      ]
    } else {
      return null
    }
  }

}

@ModelWrap('model.list.filter')
class FilterSubMenu extends FilterComponent {

  render() {
    const { filters } = this.props
    return filters && filters.length ? (<Card className="mb-3"><Card.Body><FilterInline {...this.props}/></Card.Body></Card>) : null
  }

}

@ModelWrap('model.list.filter')
class FilterNavForm extends FilterComponent {

  renderFilterForm() {
    const { _t } = app.context
    const { filters, formKey, data, changeFilter, resetFilter } = this.props
    const FormLayout = (props) => {
      const { children, invalid, pristine, handleSubmit, submitting } = props
      return (
        <Form onSubmit={handleSubmit}>
          {children}{' '}
          <Button disabled={invalid || submitting} onClick={handleSubmit}>{_t('Search')}</Button>
          {' '}
          <Button disabled={submitting} onClick={resetFilter}>{_t('Clear')}</Button>
        </Form>
      )
    }
    return (<FilterForm
      formKey={formKey}
      filters={filters}
      component={FormLayout}
      initialValues={data}
      onSubmit={changeFilter}
      group={InlineGroup}
      fieldProps={{ mode: 'base' }}
    />)
  }

  render() {
    const { filters } = this.props
    if(filters && filters.length) {
      return this.renderFilterForm()
    } else {
      return null
    }
  }

}

const block_func = (Filter, name, props) => ({ model }) => (
  (model && model.filters && model.filters[name]) ? <Filter name={name} {...props} /> : null
)

export default {
  name: 'xadmin.filter',
  blocks: {
    'model.list.nav': () => [ <FilterModal name="nav" />, <FilterNavForm name="navform" /> ],
    'model.list.modal': block_func(FilterModal, 'modal'),
    'model.list.popover': block_func(FilterPopover, 'popover'),
    'model.list.submenu': block_func(FilterSubMenu, 'submenu'),
    'model.list.sidemenu': block_func(FilterMenu, 'sidemenu')
  },
  mappers: {
    'model.list.filter': {
      data: ({ model, modelState }, { name }) => {
        return {
          data: modelState.wheres.filters
        }
      },
      compute: ({ model, modelState }, { data, name }) => {
        const filters = (model.filters ? (model.filters[name] || []) : []).map(filter => {
          const key = typeof filter == 'string' ? filter : filter.key
          const schema = getFieldProp(model, key)
          return schema ? {
            key, schema,
            field: typeof filter == 'string' ? { } : filter
          } : null
        }).filter(Boolean)
        return {
          filters, data: _.clone(data),
          formKey: `filter.${model.name}`
        }
      },
      method: {
        resetFilter: ({ dispatch, model, state, modelState }) => (e) => {
          const formKey = `filter.${model.name}`
          const initial = _.isFunction(model.initialValues) ? model.initialValues() : model.initialValues
          const where = initial && initial.wheres && initial.wheres.filters || {}
          const values = { ...state.form[formKey], ...where }
          const cf = []
          Object.keys(values).forEach(field => {
            if(where[field] !== undefined) {
              // dispatch(change(formKey, field, where[field]))
            } else {
              cf.push(field)
            }
          })
          if(cf.length > 0) {
            // dispatch(clearFields(formKey, false, false, ...cf))
          }

          const wheres = (Object.keys(where).length > 0 ? 
            { ...modelState.wheres, filters: where } : _.omit(modelState.wheres, 'filters'))

          dispatch({ model, type: 'GET_ITEMS', filter: { ...modelState.filter, skip: 0 }, wheres })
        },
        changeFilter: ({ dispatch, model, state, modelState }, { name }) => () => {
          const values = state.form && state.form[`filter.${model.name}`] || {}
          const where = Object.keys(values).reduce((prev, key) => {
            if(!_.isNil(values[key])) {
              prev[key] = values[key]
            } else {
              prev = _.omit(prev, key)
            }
            return prev
          }, { ...modelState.wheres.filters })
          const wheres = (Object.keys(where).length > 0 ? 
            { ...modelState.wheres, filters: where } : _.omit(modelState.wheres, 'filters'))
          dispatch({ model, type: 'GET_ITEMS', filter: { ...modelState.filter, skip: 0 }, wheres })
        }
      }
      // event: {
      //   mount: ({ dispatch, model }) => {
      //     if(model.filterDefault) {
      //       const values = _.isFunction(model.filterDefault) ? model.filterDefault() : model.filterDefault
      //       dispatch(initialize(`filter.${model.name}`, values))
      //     }
      //   }
      // }
    }
  },
  form_fields: filter_fields,
  filter_converter
}
const FilterNav = FilterModal
export {
  FilterForm,
  FilterSubMenu,
  FilterPopover,
  FilterNavForm,
  FilterMenu,
  FilterModal,
  FilterNav
}