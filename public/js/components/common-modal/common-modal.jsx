require('./common-modal.scss');
const React = require('react');
const Modal = require('react-overlays').Modal;
const InlineSVG = require('svg-inline-react');
const closeIcon = require('../../../img/Att-icons/att-icons-close.svg');
const randomID = require('../util/randomID.jsx');


const CommonModal = (props) => {
  // create props to send to `Modal`
  const modalProps = Object.assign({}, props);
  delete modalProps.heading;
  delete modalProps.triggerCloseModal;

  const ariaID = randomID();

  return (
    <Modal
      {...modalProps}
      aria-labelledby={ariaID}
    >
      <section className="att-common-modal__inner">
        <div className="att-cm-sticky-header">
          <div className="att-cm-sticky-header__header">
            <div className="att-cm-sticky-header__header__inner group">
              <h2
                id={ariaID}
                className="att-cm-sticky-header__header__inner__heading"
              >
                {props.heading}
              </h2>
              <div
                className="att-cm-sticky-header__header__inner__close"
                onClick={modalProps.onHide}
                role="button"
                tabIndex="0"
              >
                <InlineSVG
                  title="Close"
                  src={closeIcon}
                />
              </div>
            </div>
          </div>
          <div className="att-cm-sticky-header__content">
            <div className="att-cm-sticky-header__content__inner">
              {props.children}
            </div>
          </div>
        </div>
      </section>
    </Modal>
  );
};

CommonModal.propTypes = {
  children: React.PropTypes.children,
  heading: React.PropTypes.string,
  backdropClassName: React.PropTypes.string,
  className: React.PropTypes.string,
};

CommonModal.defaultProps = {
  children: {},
  heading: '',
  backdropClassName: 'att-common-modal__backdrop',
  className: 'att-common-modal',
};

module.exports = CommonModal;
