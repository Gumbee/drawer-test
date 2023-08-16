import React, { ComponentType, ReactElement } from 'react'
import { ComponentStory, Meta } from '@storybook/react'
import { factories, mocks } from '@mfe/mocks'
import SheetComponent from '../components/Sheet'

export default {
  title: 'Components/Sheet',
  component: SheetComponent,
  parameters: {
    layout: 'fullscreen',
    chromatic: { disableSnapshot: true }
  }
} as Meta

export const Sheet: ComponentStory<ComponentType> = (args) => (
      <SheetComponent {...args}>
        <div className='h-[750px]'>Some Contet</div>
      </SheetComponent>
)

Sheet.args = {
  open: true,
  spacingTop: 60
}