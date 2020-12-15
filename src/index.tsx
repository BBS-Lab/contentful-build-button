import React, {FC, useState, useCallback} from 'react'
import { render } from 'react-dom';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css'
import '@contentful/forma-36-fcss/dist/styles.css'
import './index.css';
import { Button, Dropdown, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components'

interface AppProps {
  sdk: FieldExtensionSDK;
}


const SidebarExtension: FC<AppProps> = (props: AppProps) => {
  const {sdk} = props
  const [env, setEnv] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [image, setImage] = useState(null)

  const tick =  useCallback(()=>{
    const { parameters: { installation } } = sdk
    const { statusWebhookUrlPreprod, statusWebhookUrlProd } = installation
    const url = env === 'preprod' ? statusWebhookUrlPreprod : statusWebhookUrlProd

    setImage(`${url}&date=${Date.now()}`)
  },[sdk,env,setImage])



  const triggerUpdate = useCallback(()=>{
    setInterval(tick, 10000)
  },[tick])

  const onClick = useCallback((open: Boolean) => {
    setIsOpen(open)
  },[setIsOpen])

  const onToogle = useCallback(() => {
    onClick(!isOpen)
  },[isOpen,onClick])

  const onButtonClick = useCallback((environnement) => {
    const {
      parameters: { installation },
    } = sdk

    const {
      buildWebhookUrlPreprod,
      buildWebhookUrlProd,
      statusWebhookUrlPreprod,
      statusWebhookUrlProd,
    } = installation

    const url = environnement === 'preprod' ? buildWebhookUrlPreprod : buildWebhookUrlProd
    const urlImage = environnement === 'preprod' ? statusWebhookUrlPreprod : statusWebhookUrlProd

    setEnv(environnement)
    setImage(urlImage)
    setIsOpen(false)

    const options = {
      method: 'GET',
      headers: {},
    }

    fetch(url, options).then(r => {
      if (r.ok) {
        sdk.notifier.success('Application building')
        tick()
        triggerUpdate()
      } else {
        sdk.notifier.error('Unable to build the application')
      }
    }).catch(e => {
      console.error('error', url)
      console.error('error', e)
      sdk.notifier.error('Unable to build the application')
    })
  },[setImage,setIsOpen,setEnv,sdk, tick, triggerUpdate])

  return (
      <div className="container-width">
        <Dropdown
            isOpen={isOpen}
            isAutoalignmentEnabled={false}
            onClose={()=>on(false)}
            isFullWidth={true}
            key={Date.now()}
            className="dropdownwidth"
            toggleElement={
              <Button
                  buttonType="primary"
                  isFullWidth={true}
                  testId="build-button"
                  indicateDropdown
                  onClick={() =>onToogle()}
              >
                Déployer l&apos;application
              </Button>
            }
        >
          <DropdownList>
            <DropdownListItem onClick={() => onButtonClick('preprod')}>
              Déployer en preprod
            </DropdownListItem>
            <DropdownListItem onClick={() => onButtonClick('prod')}>
              Déployer en production
            </DropdownListItem>
          </DropdownList>
        </Dropdown>

        <div className="container spacing-l">
          <img alt="" src={image } />
        </div>
      </div>
  );
};

init((sdk: FieldExtensionSDK) => {
  sdk.window.startAutoResizer();
  render(<SidebarExtension sdk={sdk} />, document.getElementById('root'));
});