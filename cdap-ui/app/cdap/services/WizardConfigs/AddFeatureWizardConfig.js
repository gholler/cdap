/*
 * Copyright © 2016 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import React from 'react';
import FeatureSchemaStep from '../../components/FeatureUI/AddFeatureWizard/FeatureSchemaStep';
import FeaturePropertiesStep from '../../components/FeatureUI/AddFeatureWizard/FeaturePropertiesStep';
import FeatureConfigurationStep from '../../components/FeatureUI/AddFeatureWizard/FeatureConfigurationStep';
import FeatureDetailStep from '../../components/FeatureUI/AddFeatureWizard/FeatureDetailStep';


const AddFeatureWizardConfig = {
  steps: [
    {
      id: 'schema',
      shorttitle: 'Schema',
      title: 'Select Schema',
      description: '',
      content: (<FeatureSchemaStep />),
    },
    {
      id: 'properties',
      shorttitle: 'Properties',
      title: 'Select Properties',
      description: '',
      content: (<FeaturePropertiesStep />)
    },
    {
      id: 'configuration',
      shorttitle: 'Configuration',
      title: 'Set Configuration',
      description: '',
      content: (<FeatureConfigurationStep />)
    },
    {
      id: 'detail',
      shorttitle: 'Details',
      title: 'Set Details',
      description: '',
      content: (<FeatureDetailStep />)
    },
  ]
};

export default AddFeatureWizardConfig;