import React,  { useState, useRef, Fragment } from 'react';
import Form, {IChangeEvent} from '@rjsf/core';
import metaSchemaDraft04 from 'ajv/lib/refs/json-schema-draft-04.json'
import JSON_RESUME_SCHEMA from '../schemes/json-resume-schema_0.0.0.json'
import { VALID_INVOKE_CHANNELS, ICvDataReturnVal, INotification } from './definitions'
import styles from './App.css'

// read https://github.com/async-library/react-async
export default function App()
{
    /**
     * State - Hooks
     */
    const [schema , setSchema] = useState(JSON_RESUME_SCHEMA as Record<string, any>);
    const [cvData, setCvData] = useState({});
    const [notifications, setNotifications] = useState<Array<INotification>>([]);
    // The ref to the Form component
    const cvForm = useRef<Form<{}>>(null);

    // Logging helper
    const log = (type: any) => console.log.bind(console, type);

    /**
     * Handler for loading CV data. Uses the defined API invoke call on the open-cv chanel. Returns JSON data which is
     * then manually validated against the current schema of the Form.
     */
    const handleOpenCvButtonClick = () => {
        window.api.invoke(VALID_INVOKE_CHANNELS['open-cv'], {foo: 'bar'}).then((result: ICvDataReturnVal) => {
            if (result.success) {
                const { errorSchema, errors } = cvForm.current.validate(result.data, schema, [metaSchemaDraft04]);
                if (errors && errors.length) {
                    setNotifications([...notifications, {type: 'warning', text: `${errors.length} validations errors found in the loaded data.`}])
                }
                setCvData(result.data);
            }
        }).catch((err: PromiseRejectionEvent) => {
            // display a warning ...TBD
            setNotifications([...notifications, {type: 'danger', text: `Opening of CV data failed: ${err}`}])
        });
    };

    /**
     * Form-data-change handler making react-jsonschema-form controlled component.
     */
    const handleFormDataChange = (changeEvent: IChangeEvent) => {
        setCvData(changeEvent.formData);
    };

    /**
     * Click-handler for the Save-cv-button which triggers the form-submit function programmatically.
     */
    const handleSaveCvButtonClick = () => {
        console.log(cvData);
        cvForm.current.submit();
    };

    /**
     * The submit-event handler.
     */
    const handleFormSubmit = (formData: Record<string, any>) => {
        console.log('VALIDATION', formData)

    };

    return <div className="container-fluid ">
        <div className="row">
            <div className="col-md-8 col-md-push-4 xs-pb-15">
                <span className="glyphicon glyphicon-info-sign float-left xs-pr-5 xs-pt-5" />
                <div className={styles['notification-area']}>
                    {
                        notifications.map((notification, index) =>
                            <div className={`alert alert-slim alert-${notification.type}`} role="alert" key={index}>{notification.text}</div>
                        )
                    }
                </div>
            </div>
            <div className="col-md-4 col-md-pull-8 xs-pb-15">
                <div className="btn-toolbar" role="toolbar" aria-label="Upper toolbar with buttons">
                    <button className='btn btn-primary' onClick={handleOpenCvButtonClick}>Open CV</button>
                    <button className='btn btn-primary' onClick={handleSaveCvButtonClick}>Process CV</button>
                </div>
            </div>
        </div>
		<Form schema={schema}
              formData={cvData}
              additionalMetaSchemas={[metaSchemaDraft04]}
              onChange={handleFormDataChange}
              onSubmit={handleFormSubmit}
              onError={log("errors")}
              ref={cvForm}>
            {/*workaround to hide the submit button, see https://github.com/rjsf-team/react-jsonschema-form/issues/705*/}
            <Fragment />
        </Form>
    </div>
}
