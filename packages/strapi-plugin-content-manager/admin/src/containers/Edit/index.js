/*
 *
 * Edit
 *
 */

// Dependencies.
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { get } from 'lodash';
import { router } from 'app';

// Components.
import EditForm from 'components/EditForm';
import EditFormRelations from 'components/EditFormRelations';
import PluginHeader from 'components/PluginHeader';

// Selectors.
import { makeSelectModels, makeSelectSchema } from 'containers/App/selectors';

// Utils.
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import templateObject from 'utils/templateObject';

// Styles.
import styles from './styles.scss';

// Actions.
import {
  setInitialState,
  setCurrentModelName,
  setIsCreating,
  loadRecord,
  setRecordAttribute,
  editRecord,
  deleteRecord,
} from './actions';

// Selectors.

import {
  makeSelectRecord,
  makeSelectLoading,
  makeSelectCurrentModelName,
  makeSelectEditing,
  makeSelectDeleting,
  makeSelectIsCreating,
} from './selectors';

import reducer from './reducer';
import saga from './sagas';

export class Edit extends React.Component {
  componentWillMount() {
    this.props.setInitialState();
    this.props.setCurrentModelName(this.props.match.params.slug.toLowerCase());

    // Detect that the current route is the `create` route or not
    if (this.props.match.params.id === 'create') {
      this.props.setIsCreating();
    } else {
      this.props.loadRecord(this.props.match.params.id);
    }
  }

  handleChange = (e) => {
    this.props.setRecordAttribute(e.target.name, e.target.value);
  };

  handleSubmit = () => {
    this.props.editRecord();
  };

  render() {
    if (this.props.loading || !this.props.schema || !this.props.currentModelName) {
      return <p>Loading...</p>;
    }

    const content = (
      <EditForm
        record={this.props.record}
        currentModelName={this.props.currentModelName}
        schema={this.props.schema}
        setRecordAttribute={this.props.setRecordAttribute}
        handleChange={this.handleChange}
        handleSubmit={this.handleSubmit}
        editing={this.props.editing}
      />
    );

    const relations = (
      <EditFormRelations
        currentModelName={this.props.currentModelName}
        record={this.props.record}
        schema={this.props.schema}
        setRecordAttribute={this.props.setRecordAttribute}
      />
    );


    // Define plugin header actions
    const pluginHeaderActions = [
      {
        label: 'content-manager.containers.Edit.cancel',
        handlei18n: true,
        buttonBackground: 'secondary',
        buttonSize: 'buttonMd',
        onClick: () => router.push(`/plugins/content-manager/${this.props.currentModelName}`),
      },
      {
        handlei18n: true,
        buttonBackground: 'primary',
        buttonSize: 'buttonLg',
        label: this.props.editing ? 'content-manager.containers.Edit.editing' : 'content-manager.containers.Edit.submit',
        onClick: this.props.editRecord,
        disabled: this.props.editing,
      },
    ];

    const pluginHeaderSubActions = [
      {
        label: 'content-manager.containers.Edit.returnList',
        handlei18n: true,
        buttonBackground: 'back',
        onClick: () => router.goBack(),
      },
    ]

    // Add the `Delete` button only in edit mode
    // if (!this.props.isCreating) {
    //   pluginHeaderActions.push({
    //     label: 'content-manager.containers.Edit.delete',
    //     class: 'btn-danger',
    //     onClick: this.props.deleteRecord,
    //     disabled: this.props.deleting,
    //   });
    // }

    // Plugin header config
    const mainField = get(this.props.models, `${this.props.currentModelName}.info.mainField`) || this.props.record.first();
    const pluginHeaderTitle = this.props.isCreating ? 'New entry' : templateObject({ mainField }, this.props.record.toJS()).mainField;
    const pluginHeaderDescription = this.props.isCreating ? 'New entry' : `#${this.props.record && this.props.record.get('id')}`;

    return (
      <div>
        <div className={`container-fluid ${styles.containerFluid}`}>
          <PluginHeader
            title={{
              id: pluginHeaderTitle,
            }}
            description={{
              id: 'plugin-content-manager-description',
              defaultMessage: `${pluginHeaderDescription}`,
            }}
            actions={pluginHeaderActions}
            subActions={pluginHeaderSubActions}
          />
          <div className='row'>
            <div className={`col-lg-9`}>
              <div className={styles.main_wrapper}>
                {content}
              </div>
            </div>
            <div className="col-lg-3">
              {relations}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Edit.propTypes = {
  currentModelName: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.string,
  ]).isRequired,
  // deleteRecord: React.PropTypes.func.isRequired,
  // deleting: React.PropTypes.bool.isRequired,
  editing: React.PropTypes.bool.isRequired,
  editRecord: React.PropTypes.func.isRequired,
  isCreating: React.PropTypes.bool.isRequired,
  loading: React.PropTypes.bool.isRequired,
  loadRecord: React.PropTypes.func.isRequired,
  match: React.PropTypes.shape({
    params: React.PropTypes.shape({
      id: React.PropTypes.string,
      slug: React.PropTypes.string,
    }),
  }).isRequired,
  models: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]).isRequired,
  record: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]).isRequired,
  schema: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]).isRequired,
  setCurrentModelName: React.PropTypes.func.isRequired,
  setInitialState: React.PropTypes.func.isRequired,
  setIsCreating: React.PropTypes.func.isRequired,
  setRecordAttribute: React.PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  record: makeSelectRecord(),
  loading: makeSelectLoading(),
  currentModelName: makeSelectCurrentModelName(),
  editing: makeSelectEditing(),
  deleting: makeSelectDeleting(),
  isCreating: makeSelectIsCreating(),
  schema: makeSelectSchema(),
  models: makeSelectModels(),
});

function mapDispatchToProps(dispatch) {
  return {
    setInitialState: () => dispatch(setInitialState()),
    setCurrentModelName: currentModelName =>
      dispatch(setCurrentModelName(currentModelName)),
    setIsCreating: () => dispatch(setIsCreating()),
    loadRecord: id => dispatch(loadRecord(id)),
    setRecordAttribute: (key, value) =>
      dispatch(setRecordAttribute(key, value)),
    editRecord: () => dispatch(editRecord()),
    deleteRecord: () => {
      // TODO: improve confirmation UX.
      if (window.confirm('Are you sure ?')) {
        // eslint-disable-line no-alert
        dispatch(deleteRecord());
      }
    },
    dispatch,
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'edit', reducer });
const withSaga = injectSaga({ key: 'edit', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(Edit);
