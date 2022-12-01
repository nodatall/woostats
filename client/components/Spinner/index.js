import React from 'react'

import './index.sass'

export default function Spinner({ styles, coreStyles }) {
  return <div className="Spinner" style={{ ...styles }}>
    <div className="Spinner-border"></div>
    <div className="Spinner-core" style={{ ...coreStyles }}></div>
  </div>
}
