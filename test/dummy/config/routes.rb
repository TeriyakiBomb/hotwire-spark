Rails.application.routes.draw do
  mount PulseWire::Engine => "/pulse_wire"
end