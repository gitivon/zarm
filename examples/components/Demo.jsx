import React from 'react';
import ReactDOM from 'react-dom';
import { Panel } from 'zarm';
import { transform } from '@babel/standalone';
import locale from 'zarm/components/locale-provider/locale/zh_CN';
import '../../components/style/entry';

export default class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.containerId = `${parseInt(Math.random() * 1e9, 10).toString(36)}`;
    this.document = this.props.children.match(/([^]*)\n?(```[^]+```)/);
    this.title = String(this.document[1]);
    this.source = this.document[2].match(/```(.*)\n?([^]+)```/);
  }

  componentDidMount() {
    this.renderSource(this.source[2]);
  }

  componentWillUnmount() {
    if (this.containerElem) {
      ReactDOM.unmountComponentAtNode(this.containerElem);
    }
  }

  renderSource(value) {
    import('../../components').then((Element) => {
      const args = ['context', 'React', 'ReactDOM', 'zarm'];
      const argv = [this, React, ReactDOM, Element];

      return {
        args,
        argv,
      };
    }).then(({ args, argv }) => {
      value = value
        .replace(/import\s+\{\s+(.*)\s+\}\s+from\s+'zarm';/, 'const { $1 } = zarm;')
        .replace('mountNode', `document.getElementById('${this.containerId}')`)
        .replace('<Demo />', `<zarm.LocaleProvider locale={${JSON.stringify(locale)}}><Demo /></zarm.LocaleProvider>`);

      const { code } = transform(value, {
        presets: ['es2015', 'react'],
      });

      args.push(code);
      // eslint-disable-next-line
      new Function(...args)(...argv);

      this.source[2] = value;
    }).catch((err) => {
      if (process.env.NODE_ENV !== 'production') {
        throw err;
      }
    });
  }

  render() {
    // Panel的例子特殊处理
    return (this.props.location.pathname === '/panel')
      ? <div id={this.containerId} ref={(elem) => { this.containerElem = elem; }} />
      : (
        <Panel title={<span>{this.title}</span>}>
          <div id={this.containerId} ref={(elem) => { this.containerElem = elem; }} />
        </Panel>
      );
  }
}
