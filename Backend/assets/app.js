import { Application, Controller } from '@hotwired/stimulus';
import { registerReactControllerComponents } from '@symfony/ux-react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';

// Start Stimulus application
const app = Application.start();

// Register all React components from the react/controllers directory
registerReactControllerComponents(require.context('./react/controllers', true, /\.(j|t)sx?$/));

// Create a Stimulus controller to handle React rendering
class ReactController extends Controller {
    connect() {
        // Get the component name and props from the data attributes
        // data-symfony--ux-react--react-component-value becomes dataset['symfony-Ux-React-ReactComponentValue'] 
        // but with proper camelCase: symfonyUxReactReactComponentValue
        const componentName = this.element.getAttribute('data-symfony--ux-react--react-component-value');
        const propsStr = this.element.getAttribute('data-symfony--ux-react--react-props-value') || '{}';
        
        let props;
        try {
            props = JSON.parse(propsStr);
        } catch (e) {
            console.error('Failed to parse props:', e);
            props = {};
        }
        
        console.log('ReactController connecting for component:', componentName, 'with props:', props);
        
        if (!componentName) {
            console.error('Component name is empty or undefined');
            return;
        }
        
        // Get the component from the global resolver
        const Component = window.resolveReactComponent(componentName);
        
        if (Component) {
            const root = createRoot(this.element);
            root.render(React.createElement(Component, props));
        } else {
            console.error(`Component ${componentName} not found`);
        }
    }
}

// Register the React controller with the exact identifier expected by Twig
app.register('symfony--ux-react--react', ReactController);

console.log('Stimulus and React are ready!');

export { app };
