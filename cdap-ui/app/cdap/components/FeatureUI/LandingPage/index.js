/* eslint react/prop-types: 0 */
import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import isNil from 'lodash/isNil';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import AddFeatureWizard from '../AddFeatureWizard';
import FeatureTable from '../FeatureTable';
import {
  PIPELINE_TYPES,
  PIPELINES_REQUEST,
  PIPELINES_REQUEST_PARAMS,
  SERVER_IP,
  SCHEMA_REQUEST,
  PROPERTY_REQUEST,
  CONFIGURATION_REQUEST,
  GET_PIPELINE,
  SAVE_PIPELINE,
  GET_SCHEMA,
  GET_PROPERTY,
  GET_CONFIGURATION,
  IS_OFFLINE,
  SAVE_REQUEST,
  DELETE_REQUEST,
  DELETE_PIPELINE,
  READ_REQUEST,
  READ_PIPELINE,
  EDIT_PIPELINE,
  EDIT_REQUEST
} from '../config';
import { Observable } from 'rxjs/Observable';
import AlertModal from '../AlertModal';
import { getPropertyUpdateObj, getFeatureObject, updatePropertyMapWithObj } from '../util';


require('./LandingPage.scss');

const SchemaData = [{ "schemaName": "accounts", "schemaColumns": [{ "columnName": "account_id", "columnType": "long" }] }, { "schemaName": "errors", "schemaColumns": [{ "columnName": "error_id", "columnType": "long" }, { "columnName": "account_id", "columnType": "long" }, { "columnName": "device_mac_address", "columnType": "string" }, { "columnName": "event_is_startup", "columnType": "boolean" }, { "columnName": "event_is_visible", "columnType": "boolean" }, { "columnName": "device_video_firmware", "columnType": "string" }, { "columnName": "event_cause_category", "columnType": "string" }, { "columnName": "event_cause_id", "columnType": "string" }, { "columnName": "hour", "columnType": "int" }, { "columnName": "device_video_model", "columnType": "string" }, { "columnName": "event_hostname", "columnType": "string" }, { "columnName": "event_date_time", "columnType": "string" }, { "columnName": "ets_timestamp", "columnType": "string" }, { "columnName": "date_hour", "columnType": "string" }, { "columnName": "count", "columnType": "int" }] }];
const PropertyData = [{ "paramName": "Indexes", "description": "" }, { "paramName": "Relationships", "description": "" }, { "paramName": "TimestampColumns", "description": "" }, { "paramName": "TimeIndexColumns", "description": "" }, { "paramName": "CategoricalColumns", "description": "" }, { "paramName": "IgnoreColumns", "description": "" }, { "paramName": "multiFieldTransFunctionInputColumns", "description": "" }, { "paramName": "multiFieldAggFunctionInputColumns", "description": "" }, { "paramName": "TargetEntity", "description": "" }, { "paramName": "TargetEntityPrimaryField", "description": "" }];
const ConfigurationData = [{ "paramName": "DFSDepth", "description": "", "isCollection": false, "dataType": "int" }, { "paramName": "TrainingWindows", "description": "", "isCollection": true, "dataType": "int" }, { "paramName": "WindowEndTime", "description": "", "isCollection": false, "dataType": "string" }];

class LandingPage extends React.Component {
  currentPipeline;
  constructor(props) {
    super(props);
    this.toggleFeatureWizard = this.toggleFeatureWizard.bind(this);
    this.onWizardClose = this.onWizardClose.bind(this);
    this.state = {
      data: [],
      dropdownOpen: false,
      showFeatureWizard: false,
      openAlertModal: false,
      alertMessage: "",
      pipelineTypes: PIPELINE_TYPES,
      selectedPipelineType: 'All',
    };
  }
  componentWillMount() {
    this.getPipelines(this.state.selectedPipelineType);
    if (IS_OFFLINE) {
      this.props.setAvailableProperties(PropertyData);
      this.props.setAvailableConfigurations(ConfigurationData);
      this.props.setAvailableSchemas(data);
    } else {
      this.fetchWizardData();
    }
  }

  fetchWizardData() {
    this.fetchProperties();
    this.fetchConfiguration();
    this.fetchSchemas();
  }

  toggleFeatureWizard() {
    let open = !this.state.showFeatureWizard;
    if (open) {
      this.props.resetStore();
      this.fetchWizardData();
    }
    this.setState({
      showFeatureWizard: open
    });
  }

  toggleDropDown() {
    this.setState(prevState => ({ dropdownOpen: !prevState.dropdownOpen }));
  }

  onPipeLineTypeChange(type) {
    this.setState({
      selectedPipelineType: type
    });
    this.getPipelines(type);
  }

  getPipelines(type) {
    let request = SERVER_IP + PIPELINES_REQUEST;
    if (type != "All") {
      request = request + PIPELINES_REQUEST_PARAMS + '=' + type;
    }
    fetch(request)
      .then(res => res.json())
      .then(
        (result) => {
          if (isNil(result) || isNil(result["pipelineInfoList"])) {
            alert("Pipeline Data Error");
          } else {
            this.setState({
              data: result["pipelineInfoList"]
            });
          }
        },
        (error) => {
          this.handleError(error, GET_PIPELINE);
        }
      );
  }

  viewPipeline(pipeline) {
    this.currentPipeline = pipeline;
  }

  editPipeline(pipeline) {
    this.currentPipeline = pipeline;
    let fetchUrl = SERVER_IP + READ_REQUEST.replace('$NAME', pipeline.pipelineName);
    fetch(fetchUrl)
      .then(res => res.json())
      .then(
        (result) => {
          if (isNil(result) || isNil(result["featureGenerationRequest"])) {
            this.handleError(result, READ_PIPELINE);
          } else {
            this.updateStoreForEdit(result["featureGenerationRequest"], EDIT_PIPELINE);
          }
        },
        (error) => {
          this.handleError(error, READ_PIPELINE);
        }
      );
  }

  updateStoreForEdit(pipelineData, type) {
    if (!isEmpty(pipelineData)) {
      console.log("Pipeline Props ->", pipelineData);
      let propertyMap = new Map();
      let configurationList = [];
      this.props.updateOperationType(type);
      for (let property in pipelineData) {
        switch (property) {
          case "pipelineRunName":
            this.props.updateFeatureName(pipelineData.pipelineRunName);
            break;
          case "dataSchemaNames":
            let selectedSchemas = [];
            pipelineData.dataSchemaNames.forEach((schema) => {
              let schemaData = find(this.props.availableSchemas, { schemaName: schema });
              if (!isNil(schemaData)) {
                selectedSchemas.push({
                  schemaName: schema,
                  selected: true,
                  schemaColumns: schemaData.schemaColumns
                });
              }
            });
            if (!isEmpty(selectedSchemas)) {
              this.props.setSelectedSchemas(selectedSchemas);
            }
            break;
          default:
            {
              let propertyData = find(this.props.availableProperties, { paramName: property });
              if (!isNil(propertyData)) {
                if(isEmpty(propertyData.subParams)) {
                  if(propertyData.isCollection) {
                    let schemaMap = new Map();
                    pipelineData[property].forEach(propData => {
                      if(schemaMap.has(propData.table)) {
                        let columns =  schemaMap.get(propData.table).push({columnName: propData.column});
                        schemaMap.set(propData.table,columns)
                      } else {
                        schemaMap.set(propData.table, [{columnName: propData.column}])
                      }
                    });
                    schemaMap.forEach((value, key) => {
                      let updatedObj = getPropertyUpdateObj(propertyData, "none", key, value);
                      updatePropertyMapWithObj(propertyMap, updatedObj);
                    });
                  } else {
                    let updatedObj = getPropertyUpdateObj(propertyData, "none", pipelineData[property].table,
                        [{columnName: pipelineData[property].column}]);
                    updatePropertyMapWithObj(propertyMap, updatedObj);
                  }
                } else {
                  if(!isEmpty(pipelineData[property])) {
                    let dataObj = pipelineData[property][0];
                    for (let subPropertyName in dataObj) {
                      let subProperty = find(propertyData.subParams, { paramName: subPropertyName });
                      if(!isNil(subProperty)) {
                        if(subProperty.isCollection) {
                          let schemaMap = new Map();
                          dataObj[subPropertyName].forEach(propData => {
                            if(schemaMap.has(propData.table)) {
                              let columns =  schemaMap.get(propData.table).push({columnName: propData.column});
                              schemaMap.set(propData.table,columns)
                            } else {
                              schemaMap.set(propData.table, [{columnName: propData.column}])
                            }
                          });
                          schemaMap.forEach((value, key) => {
                            let updatedObj = getPropertyUpdateObj(propertyData, subPropertyName, key, value);
                            updatePropertyMapWithObj(propertyMap, updatedObj);
                          });
                        } else {
                          let updatedObj = getPropertyUpdateObj(propertyData, subPropertyName, dataObj[subPropertyName].table,
                              [{columnName: dataObj[subPropertyName].column}]);
                          updatePropertyMapWithObj(propertyMap, updatedObj);
                        }
                      }
                    }
                  }
                }
              } else {
                configurationList.push({
                  name: property,
                  value: pipelineData[property].toString(),
                })
              }
            }
            break;
        }
      }
      if(propertyMap.size > 0) {
        this.props.updatePropertyMap(propertyMap);
      }
      if (!isEmpty(configurationList)) {
        this.updateConfigurationList(this.props.availableConfigurations, configurationList);
      }
      this.setState({
        showFeatureWizard: open
      });
    }
  }

  updateConfigurationList(availableConfigurations, configList) {
   let configurationList =  availableConfigurations.map((config)=> {
      let configObj = find(configList, {name: config.paramName});
      return {
        name: config.paramName,
        value: isEmpty(configObj) ? "": configObj.value,
        dataType: config.dataType,
        isCollection: config.isCollection,
        isMandatory: config.isMandatory,
        toolTip: "Type: " + (config.isCollection ? ("Collection of "+ config.dataType): config.dataType)
      };
    });
    this.props.updateConfigurationList(configurationList);
  }

  onDeletePipeline(pipeline) {
    this.currentPipeline = pipeline;
    this.setState({
      openAlertModal: true,
      alertMessage: 'Are you sure you want to delete: ' + pipeline.pipelineName,
    });
  }

  onAlertClose(action) {
    if (action === 'OK' && this.currentPipeline) {
      this.deletePipeline(this.currentPipeline);
    }
    this.setState({
      openAlertModal: false
    });
  }

  deletePipeline(pipeline) {
    let fetchUrl = SERVER_IP + DELETE_REQUEST.replace('$NAME', pipeline.pipelineName);
    fetch(fetchUrl, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(
        (result) => {
          if (isNil(result) || (result.status && result.status > 200)) {
            this.handleError(result, DELETE_PIPELINE);
          } else {
            this.getPipelines(this.state.selectedPipelineType);
          }
        },
        (error) => {
          this.handleError(error, DELETE_PIPELINE);
        }
      );
  }

  handleError(error, type) {
    console.log(type, error);
    error.message ? alert(error.message) : alert(error);
  }

  onWizardClose() {
    console.log('Toggle');
    this.setState({
      showFeatureWizard: !this.state.showFeatureWizard
    });
  }

  openConfirmationModal() {
    this.setState({
      openConfirmation: true
    });
  }

  closeConfirmationModal() {
    this.setState({
      openConfirmation: false
    });
  }

  saveFeature() {
    let featureObject = getFeatureObject(this.props);
    let saveUrl = SERVER_IP + SAVE_REQUEST.replace('$NAME', featureObject.pipelineRunName);
    let type = this.props.operationType;
    if(type == EDIT_PIPELINE) {
      saveUrl = SERVER_IP + EDIT_REQUEST.replace('$NAME', featureObject.pipelineRunName);
    }
    console.log(featureObject);
    return Observable.create((observer) => {
      fetch(saveUrl, {
        method: 'POST',
        body: JSON.stringify(featureObject)
      }).then(res => res.json())
        .then(
          (result) => {
            if (isNil(result) || (result.status && result.status > 200)) {
              this.handleError(result, type);
              observer.error(result);
            } else {
              this.getPipelines(this.state.selectedPipelineType);
              observer.next(result);
              observer.complete();
            }
          },
          (error) => {
            this.handleError(error, type);
            observer.error(error);
          }
        );
    });
  }

  fetchSchemas() {
    let fetchUrl = SERVER_IP + SCHEMA_REQUEST;
    fetch(fetchUrl)
      .then(res => res.json())
      .then(
        (result) => {
          if (isNil(result) || isNil(result["dataSchemaList"])) {
            this.handleError(result, GET_SCHEMA);
          } else {
            this.props.setAvailableSchemas(result["dataSchemaList"]);
          }
        },
        (error) => {
          this.handleError(error, GET_SCHEMA);
        }
      );
  }

  fetchProperties() {
    let fetchUrl = SERVER_IP + PROPERTY_REQUEST;
    fetch(fetchUrl)
      .then(res => res.json())
      .then(
        (result) => {
          if (isNil(result) || isNil(result["configParamList"])) {
            this.handleError(result, GET_PROPERTY);
          } else {
            this.props.setAvailableProperties(result["configParamList"]);
          }
        },
        (error) => {
          this.handleError(error, GET_PROPERTY);
        }
      );
  }

  fetchConfiguration() {
    let fetchUrl = SERVER_IP + CONFIGURATION_REQUEST;
    fetch(fetchUrl)
      .then(res => res.json())
      .then(
        (result) => {
          if (isNil(result) || isNil(result["configParamList"])) {
            this.handleError(result, GET_CONFIGURATION);
          } else {
            this.props.setAvailableConfigurations(result["configParamList"]);
            this.updateConfigurationList(result["configParamList"], []);
          }
        },
        (error) => {
          this.handleError(error, GET_CONFIGURATION);
        }
      );
  }

  render() {
    return (
      <div className='landing-page-container'>
        <div className='top-control'>
          <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown.bind(this)}>
            <DropdownToggle caret>
              {this.state.selectedPipelineType}
            </DropdownToggle>
            <DropdownMenu>
              {
                this.state.pipelineTypes.map((type) => {
                  return (
                    <DropdownItem key={type} onClick={this.onPipeLineTypeChange.bind(this, type)}>{type}</DropdownItem>
                  );
                })
              }
            </DropdownMenu>
          </Dropdown>
          <button className="feature-button" onClick={this.toggleFeatureWizard}>+ Add New</button>
        </div>
        <FeatureTable data={this.state.data}
          onView={this.viewPipeline.bind(this)}
          onEdit={this.editPipeline.bind(this)}
          onDelete={this.onDeletePipeline.bind(this)} />
        <AddFeatureWizard showWizard={this.state.showFeatureWizard}
          onClose={this.onWizardClose}
          onSubmit={this.saveFeature.bind(this)} />
        <AlertModal open={this.state.openAlertModal} message={this.state.alertMessage}
          onClose={this.onAlertClose.bind(this)} />
      </div>
    );
  }
}
export default LandingPage;