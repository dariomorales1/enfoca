import '@testing-library/jest-dom';
import React from 'react';

// React 19 + Vitest/jsdom: algunos componentes del proyecto no importan React explícitamente
// porque confían en el transform automático del React Compiler plugin de Babel.
// En el entorno de test, ese plugin no se aplica, así que lo exponemos globalmente.
globalThis.React = React;
