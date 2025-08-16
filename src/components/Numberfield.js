import Textfield from './Textfield';

const Numberfield = ({
    value,
    onChange,
    onError,
    label,
    end,
    autoFocus,
    margin,
    style,
    placeholder,
}) => {
    return (
        <Textfield
            style={style}
            placeholder={placeholder}
            margin={margin}
            autoFocus={autoFocus}
            label={label}
            value={
                isNaN(value)
                    ? value
                    : value.toLocaleString('de-DE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
            }
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => {
                var value = e.target.value
                    .replaceAll(/\s/g, '')
                    .replaceAll('.', '')
                    .replaceAll('€', '');
                if (/^-?[0-9]*(([-+/*][0-9]+)?([,][0-9]+)?)*$/.test(value)) {
                    value = value.replaceAll(',', '.');
                    // eslint-disable-next-line
                    value = eval(value);
                    onChange(value);
                    onError && onError(false);
                } else {
                    onError && onError(true);
                }
            }}
            end={end}
        />
    );
};

export default Numberfield;
