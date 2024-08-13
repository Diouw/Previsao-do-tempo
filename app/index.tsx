import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Button, Image} from 'react-native';
import { Text, View } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

import {API_KEY} from '../components/api/apiWeather'


const Index = () => {
  const [city, setCity] = useState(null);
  const [street, setStreet] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    const getLocationAndWeather = async () => {
      try {
        // Solicita permissão de localização
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permissão de localização negada');
          return;
        }

        // Obtém a localização atual
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Obtém o endereço baseado nas coordenadas
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          let address = reverseGeocode[0];
          setCity(address.subregion);
          setStreet(address.street);
        }

        // Obtém a temperatura usando coordenadas
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        setIcon(weatherResponse.data.weather[0].icon);
        setTemperature(weatherResponse.data.main.temp);

      } catch (error) {
        console.log('Erro ao obter dados');
        console.error(error);
      }
    };

    getLocationAndWeather();
  }, []);

  return (
    <ScrollView style={styles.container}>


      <View style={styles.header}>
        <Text style={styles.city}>{city}</Text>
        <Text style={styles.date}>12 de Agosto, 2024</Text>
      </View>
      
      <View style={styles.currentWeather}>
        <Image 
          source={{uri: 'http://openweathermap.org/img/wn/'+icon+'.png'}} 
          style={styles.weatherIcon} 
        />
        <Text style={styles.temperature}>{temperature}</Text>
        <Text style={styles.weatherDescription}>Ensolarado</Text>
      </View>
      
      <View style={styles.forecast}>
        <Text style={styles.forecastTitle}>Previsão para os próximos dias:</Text>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastDay}>Terça</Text>
          <Image 
            source={{uri: 'https://openweathermap.org/img/wn/03d.png'}} 
            style={styles.forecastIcon} 
          />
          <Text style={styles.forecastTemp}>22°C</Text>
        </View>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastDay}>Quarta</Text>
          <Image 
            source={{uri: 'https://openweathermap.org/img/wn/04d.png'}} 
            style={styles.forecastIcon} 
          />
          <Text style={styles.forecastTemp}>20°C</Text>
        </View>
        {/* Adicione mais itens de previsão conforme necessário */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  city: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 18,
    color: '#666',
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: 40,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  weatherDescription: {
    fontSize: 24,
    color: '#666',
  },
  forecast: {
    marginTop: 20,
  },
  forecastTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  forecastDay: {
    fontSize: 18,
  },
  forecastIcon: {
    width: 50,
    height: 50,
  },
  forecastTemp: {
    fontSize: 18,
  },
});

export default Index;



