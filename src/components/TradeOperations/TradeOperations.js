import React, { PureComponent } from 'react';
import { compose, mapProps } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';

import {
  getCurrentCurrencyPurchase,
  getCurrentCurrencySell,
  getSelectedCurrency,
  buyCurrencyRequest,
  sellCurrencyRequest,
} from 'ducks/currency';
import { getError } from 'ducks/wallet';

const enhance = compose(
  withRouter,
  connect(
    state => ({
      currentCurrencyPurchase: getCurrentCurrencyPurchase(state),
      currentCurrencySell: getCurrentCurrencySell(state),
      selectedCurrency: getSelectedCurrency(state),
      error: getError(state),
    }),
    {
      buyCurrencyRequest,
      sellCurrencyRequest,
    },
  ),
  mapProps(
    ({
      buyCurrencyRequest,
      currentCurrencyPurchase,
      currentCurrencySell,
      error,
      selectedCurrency,
      sellCurrencyRequest,
    }) => ({
      buyCurrencyRequest,
      error,
      purchase: currentCurrencyPurchase,
      selectedCurrency,
      sell: currentCurrencySell,
      sellCurrencyRequest,
    }),
  ),
);

const Container = styled.article`
  padding-top: 40px;
`;

const InputWrapper = styled.div`
  background-color: #f2f2f2;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  margin: 5px 0;
  width: 218px;
`;

const Input = styled.input`
  background-color: transparent;
  border: none;
  text-align: right;
  width: 100%;
  padding: 5px 0 3px;
  padding-right: 50px;
  box-sizing: border-box;
`;

const Currency = styled.span`
  position: absolute;
  right: 8px;
  width: 38px;
  text-align: left;
  color: #adadad;
  top: 5px;
`;

const Button = styled.button`
  width: 100px;
  margin-left: 20px;
  border: 0;
  color: #fff;
  padding: 5px 0 3px;
  border-radius: 3px;
`;

const ButtonSell = Button.extend`
  background-color: #cb5f58;
  &:hover {
    background-color: #ba564f;
  }
`;
const ButtonPurchase = Button.extend`
  background-color: #69b3dc;
  &:hover {
    background-color: #63acd5;
  }
`;

class TradeOperations extends PureComponent {
  state = {
    inputFiat: 1,
    inputSell: this.props.sell,
    inputPurchase: this.props.purchase,
    currentInput: 'inputFiat',
  };

  componentWillReceiveProps(nextProps) {
    const { sell, purchase } = nextProps;
    const { currentInput } = this.state;
    this.changeInputs(currentInput, sell, purchase);
  }

  handleChange = event => {
    const { name, value } = event.target;
    const { sell, purchase } = this.props;

    this.setState(state => ({ [name]: value }));
    if (isNaN(event.target.value) || event.target.value === '') return;
    else this.changeInputs(event.target.name, sell, purchase);
  };

  handleBlur = () => {
    this.setState({ currentInput: 'inputFiat' });
  };

  handleFocus = event => {
    this.setState({ currentInput: event.target.name });
  };

  handleSell = event => {
    const { selectedCurrency } = this.props;
    const { inputFiat } = this.state;
    this.props.sellCurrencyRequest({ selectedCurrency, value: inputFiat });
  };

  handleBuy = event => {
    const { selectedCurrency } = this.props;
    const { inputFiat } = this.state;
    this.props.buyCurrencyRequest({ selectedCurrency, value: inputFiat });
  };

  changeInputs(name, sell, purchase) {
    switch (name) {
      case 'inputFiat': {
        this.setState(({ inputFiat }) => {
          const parsed = isNaN(inputFiat) ? 0 : parseFloat(inputFiat);
          return {
            inputSell: parsed * sell,
            inputPurchase: parsed * purchase,
          };
        });
        break;
      }
      case 'inputSell':
        this.setState(({ inputSell }) => {
          const parsedSell = isNaN(inputSell) ? 0 : parseFloat(inputSell);
          const nextFiat = parsedSell / sell;
          return {
            inputFiat: nextFiat,
            inputPurchase: nextFiat * purchase,
          };
        });
        break;
      case 'inputPurchase':
        this.setState(({ inputPurchase }) => {
          const parsedPurchase = isNaN(inputPurchase) ? 0 : parseFloat(inputPurchase);
          const nextFiat = parsedPurchase / purchase;
          return {
            inputFiat: nextFiat,
            inputSell: nextFiat * sell,
          };
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { error, selectedCurrency } = this.props;
    const { inputFiat, inputSell, inputPurchase } = this.state;
    return (
      <Container>
        <h2>Покупка/продажа</h2>
        <InputWrapper>
          <Input
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            name="inputFiat"
            value={inputFiat}
          />
          <Currency>{selectedCurrency.toUpperCase()}</Currency>
        </InputWrapper>
        <div>
          <InputWrapper>
            <Input
              onChange={this.handleChange}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              name="inputPurchase"
              value={inputPurchase}
            />
            <Currency>$</Currency>
          </InputWrapper>
          <ButtonSell onClick={this.handleSell}>Продать</ButtonSell>
        </div>
        <div>
          <InputWrapper>
            <Input
              onChange={this.handleChange}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              name="inputSell"
              value={inputSell}
            />
            <Currency>$</Currency>
          </InputWrapper>
          <ButtonPurchase onClick={this.handleBuy}>Купить</ButtonPurchase>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </Container>
    );
  }
}

export default enhance(TradeOperations);
